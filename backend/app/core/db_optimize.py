from sqlalchemy import text
from app.core.database import engine


INDEX_STATEMENTS = [
    """
    IF OBJECT_ID('products') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_products_code' AND object_id = OBJECT_ID('products'))
    CREATE UNIQUE NONCLUSTERED INDEX IX_products_code ON products(code)
    """,
    """
    IF OBJECT_ID('products') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_products_category' AND object_id = OBJECT_ID('products'))
    CREATE NONCLUSTERED INDEX IX_products_category ON products(category)
    INCLUDE (name, unit, min_stock, is_active)
    """,
    """
    IF OBJECT_ID('products') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_products_active' AND object_id = OBJECT_ID('products'))
    CREATE NONCLUSTERED INDEX IX_products_active ON products(is_active)
    INCLUDE (code, name, category)
    """,
    """
    IF OBJECT_ID('lots') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_lots_product' AND object_id = OBJECT_ID('lots'))
    CREATE NONCLUSTERED INDEX IX_lots_product ON lots(product_id)
    INCLUDE (lot_number, current_qty, expiry_date, status, location)
    """,
    """
    IF OBJECT_ID('lots') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_lots_expiry' AND object_id = OBJECT_ID('lots'))
    CREATE NONCLUSTERED INDEX IX_lots_expiry ON lots(expiry_date)
    INCLUDE (product_id, lot_number, current_qty, status)
    """,
    """
    IF OBJECT_ID('lots') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_lots_status' AND object_id = OBJECT_ID('lots'))
    CREATE NONCLUSTERED INDEX IX_lots_status ON lots(status)
    INCLUDE (product_id, expiry_date, current_qty)
    """,
    """
    IF OBJECT_ID('lots') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_lots_location' AND object_id = OBJECT_ID('lots'))
    CREATE NONCLUSTERED INDEX IX_lots_location ON lots(location)
    INCLUDE (product_id, lot_number, current_qty, status)
    """,
    """
    IF OBJECT_ID('lots') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_lots_lot_number' AND object_id = OBJECT_ID('lots'))
    CREATE NONCLUSTERED INDEX IX_lots_lot_number ON lots(lot_number)
    """,
    """
    IF OBJECT_ID('movements') IS NOT NULL
    AND COL_LENGTH('movements', 'lot_id') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movements_lot' AND object_id = OBJECT_ID('movements'))
    CREATE NONCLUSTERED INDEX IX_movements_lot ON movements(lot_id)
    """,
    """
    IF OBJECT_ID('movements') IS NOT NULL
    AND COL_LENGTH('movements', 'product_id') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movements_product' AND object_id = OBJECT_ID('movements'))
    CREATE NONCLUSTERED INDEX IX_movements_product ON movements(product_id)
    """,
        """
        IF OBJECT_ID('wms_tasks') IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_wms_tasks_status')
        CREATE NONCLUSTERED INDEX IX_wms_tasks_status ON wms_tasks(status)
        """,
        """
        IF OBJECT_ID('wms_tasks') IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_wms_tasks_type')
        CREATE NONCLUSTERED INDEX IX_wms_tasks_type ON wms_tasks(task_type)
        """,
        """
        IF OBJECT_ID('wms_tasks') IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_wms_tasks_lot')
        CREATE NONCLUSTERED INDEX IX_wms_tasks_lot ON wms_tasks(lot_id)
        """,
        """
        IF OBJECT_ID('wms_tasks') IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_wms_tasks_barcode')
        CREATE NONCLUSTERED INDEX IX_wms_tasks_barcode ON wms_tasks(barcode)
        """,    
]


def ensure_performance_indexes() -> None:
    with engine.begin() as conn:
        for stmt in INDEX_STATEMENTS:
            try:
                conn.execute(text(stmt))
            except Exception as e:
                print(f"[db_optimize] índice omitido: {e}")

      