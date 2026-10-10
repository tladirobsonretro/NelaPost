# NelaPost

Create. Schedule. Publish.

NelaPost is a free, open-source social publishing workspace. The Business tools module adds a small-business POS and operations workspace for CornerCo Water & Ice.

## Business tools

Open **Business tools** in the NelaPost sidebar or visit `/business`.

- Record sales by staff member and payment method.
- Manage products, selling prices, unit costs and stock.
- Record operating expenses separately from stock purchases.
- View daily sales and profit summaries plus monthly reports.
- Export monthly sales and expense records to CSV.

## Accounting notes

Gross profit is recorded sales less the unit costs of the products sold. Estimated net profit subtracts operating expenses from gross profit. Stock purchases are tracked separately to avoid double-counting them alongside cost of goods sold. Figures are estimates and exclude tax and any costs not entered in the workspace.

## Shared records and setup

The business module uses the existing NelaPost Supabase project and its authenticated-user database access. Its tables are `business_products`, `business_staff`, `business_sales` and `business_expenses`. Signed-in NelaPost users can access the shared CornerCo workspace. Add actual product prices, costs, opening stock and staff names before using the POS for live transactions. No example prices are preloaded.

## Social publishing

The original post composer, calendar, drafts, media library and connected social accounts remain in NelaPost.
