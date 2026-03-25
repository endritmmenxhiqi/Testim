# Protocol Handler Registration Explanation (BGT System)

To allow the web portal to launch the desktop app using `seb://start?code=...`, we must register a Custom URL Protocol in the Windows Registry.

## 1. Registry Structure
We need to create the following key structure in `HKEY_CLASSES_ROOT`:

```
[HKEY_CLASSES_ROOT\seb]
@="URL:SEB Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\seb\shell]
[HKEY_CLASSES_ROOT\seb\shell\open]
[HKEY_CLASSES_ROOT\seb\shell\open\command]
@="\"C:\\Path\\To\\YourApp.exe\" \"%1\""
```

## 2. Programmatic Registration (C#)
Add this method to `App.xaml.cs` (StartUp event) to ensure it's registered on the student's PC. *Note: Requires Admin Privileges.*

```csharp
using Microsoft.Win32;

public void RegisterProtocol()
{
    string appPath = System.Reflection.Assembly.GetExecutingAssembly().Location;
    // For .NET Core/5+ single file, might need: Process.GetCurrentProcess().MainModule.FileName;
    appPath = appPath.Replace(".dll", ".exe"); // Fix for some .NET Core builds if needed

    try
    {
        using (var key = Registry.ClassesRoot.CreateSubKey("seb"))
        {
            key.SetValue(string.Empty, "URL:SEB Protocol");
            key.SetValue("URL Protocol", string.Empty);

            using (var shellKey = key.CreateSubKey(@"shell\open\command"))
            {
                shellKey.SetValue(string.Empty, $"\"{appPath}\" \"%1\"");
            }
        }
    }
    catch (UnauthorizedAccessException)
    {
        // App must be run as Admin once to register keys
    }
}
```

## 3. Manual .Reg File
You can also run this `.reg` file on the machine:

```registry
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\seb]
@="URL:SEB Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\seb\shell]

[HKEY_CLASSES_ROOT\seb\shell\open]

[HKEY_CLASSES_ROOT\seb\shell\open\command]
@="\"C:\\Users\\Student\\Desktop\\LockdownBrowser.exe\" \"%1\""
```
