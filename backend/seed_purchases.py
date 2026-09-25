import asyncio
from app.mongodb import sync_customer_purchase, get_async_mongo_db

INITIAL_PURCHASES = {
  'sarah.jenkins@novastore.com': {
    'name': 'Sarah Jenkins',
    'orders': [
      {
        'order_id': 'ORD-SARA-9921',
        'product_name': 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
        'price': '$399.00',
        'purchase_date': '2026-03-21',
        'status': 'Delivered',
        'serial_number': 'SN-SONY-884102',
        'delivery_note': 'Delivered via DHL Express with signature verification.'
      },
      {
        'order_id': 'ORD-SARA-1102',
        'product_name': 'Bose QuietComfort Ultra Wireless Earbuds',
        'price': '$299.00',
        'purchase_date': '2026-02-14',
        'status': 'Delivered',
        'serial_number': 'SN-BOSE-QC-9920',
        'delivery_note': 'Delivered to resident mailbox.'
      }
    ]
  },
  'david.miller@novastore.com': {
    'name': 'David Miller',
    'orders': [
      {
        'order_id': 'ORD-DAVI-7712',
        'product_name': 'Apple MacBook Pro 14" M3 Pro (Space Black)',
        'price': '$1,999.00',
        'purchase_date': '2026-03-22',
        'status': 'Delivered',
        'serial_number': 'SN-APPL-M3P-4401',
        'delivery_note': 'Signed by building front desk.'
      }
    ]
  },
  'elena.rostova@novastore.com': {
    'name': 'Dr. Elena Rostova',
    'orders': [
      {
        'order_id': 'ORD-ELEN-8841',
        'product_name': 'NovaPower Smart Battery Backup Pack B-90',
        'price': '$650.00',
        'purchase_date': '2026-03-20',
        'status': 'Delivered',
        'serial_number': 'SN-NVBAT-90022',
        'delivery_note': 'Delivered to On-Premise Chemical Laboratory Storage facility.'
      }
    ]
  },
  'alex.chen@novastore.com': {
    'name': 'Alex Chen',
    'orders': [
      {
        'order_id': 'ORD-ALEX-4412',
        'product_name': 'Samsung Galaxy S24 Ultra 5G (Titanium Gray)',
        'price': '$1,299.00',
        'purchase_date': '2026-03-19',
        'status': 'Delivered',
        'serial_number': 'SN-SAMS-S24U-7721',
        'delivery_note': 'Delivered via courier.'
      }
    ]
  },
  'priya.patel@novastore.com': {
    'name': 'Priya Patel',
    'orders': [
      {
        'order_id': 'ORD-PRIY-5531',
        'product_name': 'Dell UltraSharp 27" 4K OLED Monitor (U2723QE)',
        'price': '$599.00',
        'purchase_date': '2026-03-18',
        'status': 'Delivered',
        'serial_number': 'SN-DELL-4K-1109',
        'delivery_note': 'Delivered to corporate office reception.'
      }
    ]
  },
  'marcus.vance@novastore.com': {
    'name': 'Marcus Vance',
    'orders': [
      {
        'order_id': 'ORD-MARC-6624',
        'product_name': 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
        'price': '$199.00',
        'purchase_date': '2026-03-17',
        'status': 'Delivered',
        'serial_number': 'SN-KEYCH-Q1P-302',
        'delivery_note': 'Placed in secure apartment mailbox.'
      }
    ]
  },
  'olivia.taylor@novastore.com': {
    'name': 'Olivia Taylor',
    'orders': [
      {
        'order_id': 'ORD-OLIV-7789',
        'product_name': 'Apple Watch Ultra 2 (Titanium / Ocean Band)',
        'price': '$799.00',
        'purchase_date': '2026-03-15',
        'status': 'Delivered',
        'serial_number': 'SN-APPL-WUT-9904',
        'delivery_note': 'Signed by recipient.'
      },
      {
        'order_id': 'ORD-OLIV-9123',
        'product_name': 'Apple MacBook Pro 14" M3 Pro (Space Black)',
        'price': '$1,999.00',
        'purchase_date': '2026-02-10',
        'status': 'Delivered',
        'serial_number': 'SN-182100',
        'delivery_note': 'Delivered to residential concierge.'
      }
    ]
  },
  'hassan.raza@novastore.com': {
    'name': 'Hassan Raza',
    'orders': [
      {
        'order_id': 'ORD-HASS-8810',
        'product_name': 'Logitech MX Master 3S Ergonomic Wireless Mouse',
        'price': '$99.00',
        'purchase_date': '2026-03-14',
        'status': 'Delivered',
        'serial_number': 'SN-LOGI-MX3S-5501',
        'delivery_note': 'Delivered via standard parcel post.'
      }
    ]
  }
}

async def seed_all():
    total = 0
    for email, data in INITIAL_PURCHASES.items():
        name = data['name']
        for o in data['orders']:
            record = dict(o)
            record['customer_email'] = email
            record['customer_name'] = name
            ok = await sync_customer_purchase(record)
            if ok:
                total += 1
    print(f'Successfully seeded {total} customer purchases into MongoDB Atlas!')
    
    db = get_async_mongo_db()
    count = await db.customer_purchases.count_documents({})
    print(f'Verified total in collection customer_purchases: {count}')

if __name__ == '__main__':
    asyncio.run(seed_all())
