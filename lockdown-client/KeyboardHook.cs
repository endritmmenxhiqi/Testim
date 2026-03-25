using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Input;

namespace LockdownBrowser
{
    public class KeyboardHook
    {
        private const int WH_KEYBOARD_LL = 13;
        private const int WM_KEYDOWN = 0x0100;
        private const int WM_SYSKEYDOWN = 0x0104;

        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);
        
        public Action<string>? ViolationDetected;

        
        // RREGULLIMI CS8618: Shtohet '?' sepse inicializohet vetem kur thirret Install()
        private LowLevelKeyboardProc? _proc;
        private IntPtr _hookID = IntPtr.Zero;

        public void Install()
        {
            _proc = HookCallback;
            _hookID = SetHook(_proc);
        }

        public void Uninstall()
        {
            if (_hookID != IntPtr.Zero)
            {
                UnhookWindowsHookEx(_hookID);
            }
        }

        private IntPtr SetHook(LowLevelKeyboardProc proc)
        {
            using (Process curProcess = Process.GetCurrentProcess())
            // RREGULLIMI CS8600 & CS8602: Kontrollojme nese MainModule nuk eshte null
            using (ProcessModule? curModule = curProcess.MainModule)
            {
                if (curModule != null && curModule.ModuleName != null)
                {
                    return SetWindowsHookEx(WH_KEYBOARD_LL, proc,
                        GetModuleHandle(curModule.ModuleName), 0);
                }
                return IntPtr.Zero;
            }
        }

        private IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0 && (wParam == (IntPtr)WM_KEYDOWN || wParam == (IntPtr)WM_SYSKEYDOWN))
            {
                int vkCode = Marshal.ReadInt32(lParam);
                Key key = KeyInterop.KeyFromVirtualKey(vkCode);

                // Win32 check state
                bool ctrl = (GetKeyState(VK_CONTROL) & 0x8000) != 0;
                bool alt = (GetKeyState(VK_MENU) & 0x8000) != 0;

                // 1. Block Windows Keys
                if (key == Key.LWin || key == Key.RWin) {
                    ViolationDetected?.Invoke("Windows Key");
                    return (IntPtr)1;
                }

                // 2. Block Alt+Tab
                if (alt && key == Key.Tab) {
                    ViolationDetected?.Invoke("Alt+Tab");
                    return (IntPtr)1;
                }

                // 3. Block Alt+Esc
                if (alt && key == Key.Escape) {
                    ViolationDetected?.Invoke("Alt+Esc");
                    return (IntPtr)1;
                }

                // 4. Block Ctrl+Esc
                if (ctrl && key == Key.Escape) {
                    ViolationDetected?.Invoke("Ctrl+Esc");
                    return (IntPtr)1;
                }

                // 5. Block Edit Shortcuts (Ctrl+A, C, V, X, Z)
                if (ctrl)
                {
                    if (key == Key.A || key == Key.C || key == Key.V || 
                        key == Key.X || key == Key.Z)
                    {
                        ViolationDetected?.Invoke($"Ctrl+{key}");
                        return (IntPtr)1; // Block
                    }
                }
            }
            return CallNextHookEx(_hookID, nCode, wParam, lParam);
        }

        private const int VK_CONTROL = 0x11;
        private const int VK_MENU = 0x12;

        [DllImport("user32.dll", CharSet = CharSet.Auto, CallingConvention = CallingConvention.StdCall)]
        private static extern short GetKeyState(int nVirtKey);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string? lpModuleName);
    }
}