Option Explicit
' Run this ONCE to create a desktop shortcut.
' After running, double-click "Prompt Architect" on your desktop to launch.

Dim sh, fso, appDir, desktop, lnk

Set sh      = CreateObject("WScript.Shell")
Set fso     = CreateObject("Scripting.FileSystemObject")
appDir      = fso.GetParentFolderName(WScript.ScriptFullName)
desktop     = sh.SpecialFolders("Desktop")

Dim launcherPath
launcherPath = appDir & "\Start Prompt Architect.vbs"

If Not fso.FileExists(launcherPath) Then
    MsgBox "Could not find 'Start Prompt Architect.vbs' in:" & vbCrLf & appDir & vbCrLf & vbCrLf & _
           "Make sure you are running this script from the correct folder.", _
           vbCritical, "Setup Error"
    WScript.Quit 1
End If

' Create the .lnk shortcut
Set lnk = sh.CreateShortcut(desktop & "\Prompt Architect.lnk")
lnk.TargetPath       = "wscript.exe"
lnk.Arguments        = """" & launcherPath & """"
lnk.WorkingDirectory = appDir
lnk.Description      = "Enterprise Website Prompt Architect — Generate and build websites with AI"
lnk.IconLocation     = "%SystemRoot%\System32\shell32.dll, 13"
lnk.WindowStyle      = 1
lnk.Save

MsgBox "Setup complete!" & vbCrLf & vbCrLf & _
       "A 'Prompt Architect' shortcut has been added to your Desktop." & vbCrLf & _
       "Double-click it any time to launch the app.", _
       vbInformation, "Prompt Architect — Setup Complete"
