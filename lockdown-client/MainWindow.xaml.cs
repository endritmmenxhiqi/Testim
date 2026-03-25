using System;
using System.Diagnostics;
using System.Linq;
using System.Windows;
using System.Windows.Threading;
using System.Runtime.InteropServices;
using Microsoft.Web.WebView2.Core;
using System.Net.Http;
using System.Text.Json;
using System.Text;
using System.Threading.Tasks;

namespace LockdownBrowser
{
    public partial class MainWindow : Window
    {
        private DispatcherTimer _watchdogTimer;
        private DispatcherTimer _clipboardTimer;
        private KeyboardHook _hook;
        private bool _isExamActive = true;
        
        // Backend Integration
        private int _examId;
        private int _studentId;
        private string _token = "";
        private static readonly HttpClient _httpClient = new HttpClient();
        // Cooldown: nuk e regjistrojmë të njëjtin proces më shumë se 1 herë/30 sek
        private readonly Dictionary<string, DateTime> _violationCooldowns = new Dictionary<string, DateTime>();


        public MainWindow()
        {
            InitializeComponent();
            InitializeSecurity();
        }

        private void InitializeSecurity()
        {
            // 1. Hook Keyboard
            _hook = new KeyboardHook();
            _hook.ViolationDetected += (title) => {
                Dispatcher.Invoke(async () => await LogViolationInternalAsync(title));
            };
            _hook.Install();

            // 2. Start Process Watchdog
            _watchdogTimer = new DispatcherTimer();
            _watchdogTimer.Interval = TimeSpan.FromMilliseconds(500);
            _watchdogTimer.Tick += ProcessWatchdog_Tick;
            _watchdogTimer.Start();

            // 3. Start Clipboard Cleaner
            _clipboardTimer = new DispatcherTimer();
            _clipboardTimer.Interval = TimeSpan.FromSeconds(5);
            _clipboardTimer.Tick += (s, e) => Clipboard.Clear();
            _clipboardTimer.Start();
        }

        private TimeSpan _timeRemaining;
        private DispatcherTimer _examTimer;

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            try 
            {
                string[] args = Environment.GetCommandLineArgs();
                
                // Default values
                int durationMinutes = 60;
                string studentName = "Student";
                string targetUrl = "https://www.google.com";

                if (args.Length > 1) 
                {
                    string rawUri = args[1]; 
                    int qIndex = rawUri.IndexOf('?');
                    if (qIndex != -1)
                    {
                        string query = rawUri.Substring(qIndex + 1);
                        string[] pairs = query.Split('&');
                        
                        foreach (var pair in pairs)
                        {
                            string[] kv = pair.Split('=');
                            if (kv.Length == 2)
                            {
                                string key = kv[0].ToLower();
                                string val = System.Net.WebUtility.UrlDecode(kv[1]);

                                if (key == "url") targetUrl = val;
                                else if (key == "duration") int.TryParse(val, out durationMinutes);
                                else if (key == "student") studentName = val;
                                else if (key == "examid") int.TryParse(val, out _examId);
                                else if (key == "studentid") int.TryParse(val, out _studentId);
                                else if (key == "token") _token = val;
                            }
                        }
                    }
                }

                // Update UI
                StudentNameTxt.Text = studentName;
                if (!string.IsNullOrEmpty(studentName)) AvatarLetter.Text = studentName.Substring(0, 1).ToUpper();
                ExamBrowser.Source = new Uri(targetUrl);

                // Start Timer
                _timeRemaining = TimeSpan.FromMinutes(durationMinutes);
                _examTimer = new DispatcherTimer();
                _examTimer.Interval = TimeSpan.FromSeconds(1);
                _examTimer.Tick += ExamTimer_Tick;
                _examTimer.Start();
                UpdateTimerDisplay();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Initialization Error: {ex.Message}");
            }
        }

        private async void ExamTimer_Tick(object sender, EventArgs e)
        {
            if (_timeRemaining.TotalSeconds > 0)
            {
                _timeRemaining = _timeRemaining.Subtract(TimeSpan.FromSeconds(1));
                UpdateTimerDisplay();
            }
            else
            {
                _examTimer.Stop();
                MessageBox.Show("Koha ka mbaruar! Provimi do të mbyllet.", "Koha Përfundoi", MessageBoxButton.OK, MessageBoxImage.Information);
                await SendExamFinishedAsync();
                ShutdownApp();
            }
        }

        private void UpdateTimerDisplay()
        {
            TimerTxt.Text = _timeRemaining.ToString(@"hh\:mm\:ss");
            
            // Visual alert for low time
            if (_timeRemaining.TotalMinutes < 5) TimerTxt.Foreground = System.Windows.Media.Brushes.Red;
            else TimerTxt.Foreground = System.Windows.Media.Brushes.White;
        }

        private async void ProcessWatchdog_Tick(object sender, EventArgs e)
        {
            string[] bannedApps = { "taskmgr", "discord", "snippingtool", "notepad" };
            var processes = Process.GetProcesses();

            foreach (var p in processes)
            {
                try
                {
                    string processName = p.ProcessName.ToLower();
                    if (bannedApps.Contains(processName))
                    {
                        p.Kill();
                        Debug.WriteLine($"Killed forbidden process: {processName}");
                        await LogViolationInternalAsync(processName);
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error killing/logging process: {ex.Message}");
                }
            }
        }

        private async Task LogViolationInternalAsync(string title)
        {
            try 
            {
                // Cooldown: regjistrojmë vetëm 1 herë në 30 sekonda për të njëjtën shkelje
                bool isCollingDown = _violationCooldowns.TryGetValue(title, out DateTime lastLogged) && 
                                    (DateTime.Now - lastLogged).TotalSeconds < 30;

                if (!isCollingDown && !string.IsNullOrEmpty(_token))
                {
                    var payload = new { ExamId = _examId, StudentId = _studentId, ProcessName = title };
                    var json = JsonSerializer.Serialize(payload);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    
                    _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _token);
                    await _httpClient.PostAsync("http://localhost:5001/api/Exam/log-violation", content);
                    
                    _violationCooldowns[title] = DateTime.Now;
                    Debug.WriteLine($"Logged violation: {title}");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error in LogViolationInternalAsync: {ex.Message}");
            }
        }

        private async void FinishExam_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show("A jeni i sigurt qe doni te perfundoni?", "Konfirmo", MessageBoxButton.YesNo);
            if (result == MessageBoxResult.Yes)
            {
                await SendExamFinishedAsync();
                ShutdownApp();
            }
        }

        private async Task SendExamFinishedAsync()
        {
            try 
            {
                if (!string.IsNullOrEmpty(_token))
                {
                    var req = new HttpRequestMessage(HttpMethod.Post, "http://localhost:5001/api/Exam/save-result");
                    req.Headers.Add("Authorization", $"Bearer {_token}");
                    var payload = new { ExamId = _examId, StudentId = _studentId, Score = 0 };
                    req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                    await _httpClient.SendAsync(req);
                }
            } 
            catch { /* Ignore if it fails right before closing */ }
        }

        // Emergency Exit: Ctrl+Shift+F12
        protected override void OnPreviewKeyDown(System.Windows.Input.KeyEventArgs e)
        {
            if (e.Key == System.Windows.Input.Key.F12 && 
                (System.Windows.Input.Keyboard.Modifiers & System.Windows.Input.ModifierKeys.Control) == System.Windows.Input.ModifierKeys.Control &&
                (System.Windows.Input.Keyboard.Modifiers & System.Windows.Input.ModifierKeys.Shift) == System.Windows.Input.ModifierKeys.Shift)
            {
                 // Emergency shutdown
                 SendExamFinishedAsync().ContinueWith(t => Dispatcher.Invoke(ShutdownApp));
            }
        }

        private void ShutdownApp()
        {
            _isExamActive = false;
            _hook?.Uninstall(); // Release hooks safely
            _watchdogTimer?.Stop();
            Application.Current.Shutdown();
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            // Prevent Alt+F4 or accidental closing unless logic permits
            if (_isExamActive) e.Cancel = true;
        }
    }
}
