Option Explicit
' Stops the Prompt Architect server cleanly.

Dim sh
Set sh = CreateObject("WScript.Shell")

' Kill only Python processes holding port 3737
Dim result
result = sh.Run("cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| find "":3737 ""') do taskkill /f /pid %a > nul 2>&1", 0, True)

If result = 0 Then
    MsgBox "Prompt Architect server stopped.", vbInformation, "Prompt Architect"
Else
    MsgBox "No server was running on port 3737.", vbInformation, "Prompt Architect"
End If
