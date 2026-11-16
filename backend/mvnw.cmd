@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@IF "%DEBUG%" == "" @ECHO OFF
@setlocal

set ERROR_CODE=0

@REM To isolate internal variables from possible environment variables, use MAVEN_BATCH_PAUSE
@SET MAVEN_BATCH_PAUSE=never

@REM ==== START VALIDATION ====
IF NOT "%JAVA_HOME%" == "" GOTO OkJHome

ECHO.
ECHO Error: JAVA_HOME not found in your environment. >&2
ECHO Please set the JAVA_HOME variable in your environment to match the >&2
ECHO location of your Java installation. >&2
ECHO.
GOTO error

:OkJHome
IF EXIST "%JAVA_HOME%\bin\java.exe" GOTO init

ECHO.
ECHO Error: JAVA_HOME is set to an invalid directory. >&2
ECHO JAVA_HOME = "%JAVA_HOME%" >&2
ECHO Please set the JAVA_HOME variable in your environment to match the >&2
ECHO location of your Java installation. >&2
ECHO.
GOTO error

:init
@REM Decide how to start JVM
set JAVACMD="%JAVA_HOME%\bin\java.exe"

set MAVEN_CMD_LINE_ARGS=%*
set BASE_DIR=%~dp0
set WRAPPER_JAR="%BASE_DIR%\.mvn\wrapper\maven-wrapper.jar"

%JAVACMD% -jar %WRAPPER_JAR% %MAVEN_CMD_LINE_ARGS%
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
exit /B %ERROR_CODE%

