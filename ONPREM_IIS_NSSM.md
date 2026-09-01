# Yazoo Lab — instalación on-premise (IIS + NSSM + SQL Express)

Objetivo: la OptiPlex sirve la API y el frontend en la LAN, SQL Express en el SSD, backup `.bak` en el HDD de 512 GB.

No sustituye el papel Y-FO. Es el empaque del piloto.

---

## 1. Disco y carpetas

| Disco | Uso |
|---|---|
| SSD 1 TB (`C:`) | Windows, SQL Express, `C:\apps\Inventario-yazoo`, logs |
| HDD 512 GB (`D:` o la letra que tenga) | Solo backups `D:\YazooBackup` |

Crear:

```
C:\apps\Inventario-yazoo\          (código)
C:\apps\Inventario-yazoo\frontend\dist
C:\logs\yazoo\
D:\YazooBackup\
```

`.env` del backend (ya lo tienes):

```
DB_SERVER=DESKTOP-JGB8EAN\SQLEXPRESS
DB_NAME=YazooLabInventory
DB_TRUSTED_CONNECTION=yes
YAZOO_BACKUP_DIR=D:\YazooBackup
ENVIRONMENT=production
```

SQL Express debe poder escribir en `D:\YazooBackup`. Si el `.bak` no sale, da control total a `NT SERVICE\MSSQL$SQLEXPRESS` sobre esa carpeta.

---

## 2. Build del frontend (una vez por versión)

En PowerShell, como administrador no es obligatorio:

```powershell
cd C:\apps\Inventario-yazoo\frontend
npm ci
npm run build
```

Queda `frontend\dist\`. Eso es lo que sirve IIS. En producción **no** se usa `npm run dev` ni el puerto 3005.

El `frontend\src\services\api.ts` debe apuntar a `/api/v1` (misma origen) o a `http://NOMBRE-PC/api/v1`. Si en dev usabas `http://172.21.20.14:8000`, en build de planta usa ruta relativa `/api/v1`.

---

## 3. API como servicio Windows (NSSM)

1. Descarga NSSM: https://nssm.cc/download  
   Copia `nssm.exe` a `C:\apps\nssm\nssm.exe`.

2. Localiza Python del proyecto (venv):

```
C:\apps\Inventario-yazoo\backend\.venv\Scripts\python.exe
```

Si no hay venv:

```powershell
cd C:\apps\Inventario-yazoo\backend
python -m venv .venv
.\.venv\Scripts\pip install -r ..\requirements.txt
```

3. Instalar servicio:

```powershell
cd C:\apps\nssm
.\nssm.exe install YazooLabApi
```

En la ventana NSSM:

| Campo | Valor |
|---|---|
| Path | `C:\apps\Inventario-yazoo\backend\.venv\Scripts\python.exe` |
| Startup directory | `C:\apps\Inventario-yazoo\backend` |
| Arguments | `-m uvicorn app.main:app --host 127.0.0.1 --port 8000` |
| Output (I/O) | `C:\logs\yazoo\api-out.log` |
| Error | `C:\logs\yazoo\api-err.log` |

4. Arrancar:

```powershell
.\nssm.exe start YazooLabApi
curl http://127.0.0.1:8000/health
```

Debe devolver `{"status":"ok"...}`.  
Si falla: mira `C:\logs\yazoo\api-err.log`. Casi siempre es `.env` o el ODBC Driver 17.

La API **solo escucha en 127.0.0.1**. IIS es la cara a la LAN.

---

## 4. IIS como puerta (estáticos + proxy /api)

1. Windows: Activar **IIS**, **CGI**, **WebSockets** si aparece.  
2. Instalar [URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) y [Application Request Routing (ARR)](https://www.iis.net/downloads/microsoft/application-request-routing).  
3. En IIS → ARR → Server Proxy Settings → **Enable proxy**.

4. Sitio nuevo:

- Nombre: `YazooLab`
- Ruta física: `C:\apps\Inventario-yazoo\frontend\dist`
- Binding: `http`, puerto `80`, todas las IPs  
  (o un host header `lab.yazoo.local`)

5. En la raíz de `dist`, archivo `web.config`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="API" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://127.0.0.1:8000/api/{R:1}" />
        </rule>
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="00:05:00" />
    </staticContent>
  </system.webServer>
</configuration>
```

6. Prueba en la OptiPlex: `http://localhost/`  
   En otro PC de la LAN: `http://DESKTOP-JGB8EAN/` o la IP.

Firewall: permitir TCP 80. **No** abrir 8000 ni 3005 a la planta.

---

## 5. Backup

Al iniciar el servicio NSSM, `run_startup_backup()` intenta:

```
BACKUP DATABASE [YazooLabInventory] TO DISK = 'D:\YazooBackup\YazooLab_AAAAMMDD_HHMMSS.bak'
```

Si SQL no puede escribir en `D:`, aparece `backup_skip_*.txt` y la API no se cae.

Copia semanal extra (opcional, Programador de tareas):

```powershell
sqlcmd -S "DESKTOP-JGB8EAN\SQLEXPRESS" -E -Q "BACKUP DATABASE [YazooLabInventory] TO DISK='D:\YazooBackup\manual.bak' WITH INIT"
```

Retención: borra `.bak` de más de 14 días a mano hasta que haya script de limpieza.

---

## 6. Arranque diario en planta

1. Encender la OptiPlex.  
2. SQL Express y `YazooLabApi` (NSSM) deben estar en Automatic.  
3. IIS World Wide Web Publishing Service en Automatic.  
4. Un usuario abre `http://IP-DEL-SERVER/` — no localhost de su PC.

Si la API no responde: `nssm restart YazooLabApi` y leer `C:\logs\yazoo\api-err.log`.

---

## 7. Lo que esto no incluye

- HTTPS interno (se puede añadir un certificado de planta después)
- Publicar a Internet
- Alta disponibilidad
- Sustituir el PDF oficial Y-FO
