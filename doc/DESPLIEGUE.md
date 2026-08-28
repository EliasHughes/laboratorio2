# Guía de despliegue — Yazoo Lab Inventory

## Requisitos
- Windows Server o PC con SQL Server (Express válido)
- Python 3.11+ (probado 3.14)
- Node.js 18+
- ODBC Driver 17 for SQL Server
- Autenticación Windows o usuario SQL

## 1. Base de datos
Crear base `YazooLabInventory`.
El backend crea tablas al arrancar (`create_all`).
Si falta una columna (ej. form_records.updated_by_id):

```sql
USE YazooLabInventory;
IF COL_LENGTH('form_records', 'updated_by_id') IS NULL
ALTER TABLE form_records ADD updated_by_id INT NULL;

DATABASE_URL=mssql+pyodbc:///?odbc_connect=DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=YazooLabInventory;Trusted_Connection=yes;
SECRET_KEY=cambiar-en-produccion
CORS_ORIGINS=http://localhost:3005,http://127.0.0.1:3005

uvicorn app.main:app --host 0.0.0.0 --port 8010

python -m app.seed

cd C:\apps\Inventario-yazoo\frontend
npm install

VITE_API_URL=http://EQUIPO:8010/api/v1

npm run dev -- --host 0.0.0.0 --port 3005

npm run build