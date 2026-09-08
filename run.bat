@echo off
REM ============================================================
REM  Calendiario - lanzador de desarrollo
REM  Doble clic para arrancar la app (Vite + Tauri dev).
REM  La ventana de consola ES el servidor: no la cierres
REM  mientras uses la app. Para parar: cierra la ventana de
REM  Calendiario o pulsa Ctrl+C aqui.
REM ============================================================

REM Situarse en la carpeta de este .bat (funciona con doble clic)
cd /d "%~dp0"

REM Asegurar que cargo/rustc estan en el PATH de esta sesion
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"

title Calendiario - dev server

echo ============================================
echo   CALENDIARIO - modo desarrollo
echo ============================================
echo.

REM Comprobaciones basicas
where node >nul 2>nul || (echo [ERROR] Node no encontrado en PATH. & pause & exit /b 1)
where cargo >nul 2>nul || (echo [ERROR] Rust/cargo no encontrado en PATH. & pause & exit /b 1)

REM Instalar dependencias npm si es la primera vez
if not exist "node_modules\" (
    echo Primera ejecucion: instalando dependencias npm...
    echo.
    call npm install
    echo.
)

echo Arrancando Vite + Tauri...
echo (la primera compilacion de Rust puede tardar unos minutos)
echo.

call npm run tauri dev

echo.
echo ============================================
echo   Servidor detenido.
echo ============================================
pause
