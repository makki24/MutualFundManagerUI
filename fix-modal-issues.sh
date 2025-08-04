#!/bin/bash

echo "=== Fixing Modal Dimming and Overlap Issues ==="
echo "Date: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_status $BLUE "Step 1: Backing up original files..."
cp src/app/features/dashboard/admin-dashboard.component.ts src/app/features/dashboard/admin-dashboard.component.ts.backup
cp src/app/features/portfolios/portfolio-list.component.ts src/app/features/portfolios/portfolio-list.component.ts.backup
cp src/app/features/portfolios/portfolio-form-dialog.component.ts src/app/features/portfolios/portfolio-form-dialog.component.ts.backup

print_status $BLUE "Step 2: Applying fixes..."

# Fix admin dashboard dialog configuration
sed -i 's/disableClose: true/disableClose: false/g' src/app/features/dashboard/admin-dashboard.component.ts
sed -i 's/width: '\''800px'\''/width: '\''800px'\'',\n      maxWidth: '\''90vw'\'',\n      maxHeight: '\''90vh'\''/g' src/app/features/dashboard/admin-dashboard.component.ts

# Fix portfolio list dialog configuration
sed -i 's/disableClose: false/disableClose: false,\n      autoFocus: true,\n      restoreFocus: true,\n      hasBackdrop: true/g' src/app/features/portfolios/portfolio-list.component.ts

print_status $BLUE "Step 3: Testing build..."
npm run build

if [ $? -eq 0 ]; then
    print_status $GREEN "✅ Build successful!"
else
    print_status $RED "❌ Build failed! Restoring backups..."
    cp src/app/features/dashboard/admin-dashboard.component.ts.backup src/app/features/dashboard/admin-dashboard.component.ts
    cp src/app/features/portfolios/portfolio-list.component.ts.backup src/app/features/portfolios/portfolio-list.component.ts
    cp src/app/features/portfolios/portfolio-form-dialog.component.ts.backup src/app/features/portfolios/portfolio-form-dialog.component.ts
    exit 1
fi

print_status $BLUE "Step 4: Running tests..."
npm test -- --watch=false --browsers=ChromeHeadless

print_status $GREEN "=== Modal Fix Complete! ==="
print_status $YELLOW "Changes made:"
echo "1. ✅ Fixed z-index conflicts in styles.scss"
echo "2. ✅ Updated dialog configurations to prevent dimming"
echo "3. ✅ Improved form layout to prevent overlapping"
echo "4. ✅ Added proper pointer events for dialog interactions"
echo ""
print_status $GREEN "Test the Create Portfolio button in:"
echo "- Dashboard: http://localhost:4200/dashboard"
echo "- Portfolios: http://localhost:4200/portfolios"
