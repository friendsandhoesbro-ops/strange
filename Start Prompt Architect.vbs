Option Explicit
' ============================================================
' Enterprise Website Prompt Architect - Launcher
' Double-click this file to open the app.
' ============================================================

Dim sh, fso, appDir
Set sh  = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
appDir  = fso.GetParentFolderName(WScript.ScriptFullName)

Const URL     = "http://localhost:3737"
Const TIMEOUT = 12000

' ── 1. Already running? Open browser and exit. ────────────────
If IsPortOpen() Then
    sh.Run URL, 1, False
    WScript.Quit 0
End If

' ── 2. Kill any stale process on port 3737 ────────────────────
sh.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| find "":3737 ""') do taskkill /f /pid %a > nul 2>&1", 0, True
WScript.Sleep 400

' ── 3. Find Python ────────────────────────────────────────────
Dim py : py = FindPython()
If py = "" Then
    MsgBox "Python 3 was not found on this computer." & vbCrLf & vbCrLf & _
           "Please install Python 3 from python.org and try again.", _
           vbCritical, "Prompt Architect - Python Required"
    WScript.Quit 1
End If

' ── 4. Start the server (hidden) ──────────────────────────────
sh.Run """" & py & """ """ & appDir & "\server.py""", 0, False

' ── 5. Wait for port 3737 to open ─────────────────────────────
Dim waited : waited = 0
Do While waited < TIMEOUT
    WScript.Sleep 500
    waited = waited + 500
    If IsPortOpen() Then Exit Do
Loop

If Not IsPortOpen() Then
    MsgBox "The server did not start." & vbCrLf & vbCrLf & _
           "Try running manually:" & vbCrLf & _
           "  python server.py" & vbCrLf & _
           "in the folder:" & vbCrLf & appDir, _
           vbExclamation, "Prompt Architect - Startup Issue"
    WScript.Quit 1
End If

' ── 6. Open in default browser ────────────────────────────────
sh.Run URL, 1, False

' ── IsPortOpen: uses netstat (reliable, not blocked by AV) ────
Function IsPortOpen()
    On Error Resume Next
    Dim r
    r = sh.Run("cmd /c netstat -ano | find "":3737"" | find ""LISTEN"" > nul 2>&1", 0, True)
    IsPortOpen = (Err.Number = 0 And r = 0)
    Err.Clear
    On Error GoTo 0
End Function

' ── FindPython: checks PATH then common install locations ─────
Function FindPython()
    Dim paths(6)
    paths(0) = "python"
    paths(1) = sh.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Programs\Python\Python313\python.exe"
    paths(2) = sh.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Programs\Python\Python312\python.exe"
    paths(3) = sh.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Programs\Python\Python311\python.exe"
    paths(4) = sh.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Programs\Python\Python310\python.exe"
    paths(5) = "C:\Python313\python.exe"
    paths(6) = "C:\Python312\python.exe"

    Dim i
    For i = 0 To 6
        If paths(i) = "python" Then
            On Error Resume Next
            Dim rc : rc = sh.Run("cmd /c python --version > nul 2>&1", 0, True)
            If Err.Number = 0 And rc = 0 Then FindPython = "python" : Exit Function
            Err.Clear : On Error GoTo 0
        ElseIf fso.FileExists(paths(i)) Then
            FindPython = paths(i) : Exit Function
        End If
    Next
    FindPython = ""
End Function
