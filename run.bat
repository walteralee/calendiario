@echo off
REM ============================================================
REM  Calendiario - lanzador de desarrollo (backend C#/.NET)
REM  Doble clic: compila el frontend y el backend y abre la app.
REM  Esta consola muestra los logs mientras la app esta abierta;
REM  al cerrar la ventana de Calendiario, termina sola.
REM
REM  Ojo: en la rama main este fichero sigue lanzando la version
REM  Tauri/Rust. Cada rama abre su propia version.
REM ============================================================

REM Situarse en la carpeta de este .bat (funciona con doble clic)
cd /d "%~dp0"

title Calendiario - desarrollo (C#)

echo ============================================
echo   CALENDIARIO - modo desarrollo (C#/.NET)
echo ============================================
echo.

REM Comprobaciones basicas
where node >nul 2>nul || (echo [ERROR] Node no encontrado en PATH. & pause & exit /b 1)
where dotnet >nul 2>nul || (echo [ERROR] .NET SDK no encontrado en PATH. & pause & exit /b 1)

REM Instalar dependencias npm si es la primera vez
if not exist "node_modules\" (
    echo Primera ejecucion: instalando dependencias npm...
    echo.
    call npm install || goto :error
    echo.
)

echo [1/3] Compilando el frontend (dist/)...
call npm run build || goto :error
echo.

echo [2/3] Compilando el backend (copia dist/ a wwwroot/)...
dotnet build src-dotnet -c Debug --nologo -v quiet || goto :error
echo.

echo [3/3] Abriendo Calendiario...
echo.
"src-dotnet\bin\Debug\net9.0\Calendiario.exe" || goto :error

echo.
echo ============================================
echo   App cerrada.
echo ============================================
exit /b 0

:error
echo.
echo ============================================
echo   [ERROR] Ha fallado el paso anterior.
echo   La app NO se ha abierto. Revisa el mensaje de arriba.
echo ============================================
pause
exit /b 1
