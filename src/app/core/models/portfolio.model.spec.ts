import { Portfolio, CreatePortfolioRequest, UpdatePortfolioRequest, PortfolioFee, CreatePortfolioFeeRequest } from './portfolio.model';

describe('Portfolio Models', () => {
  describe('Portfolio Interface', () => {
    it('should create a portfolio object with required fields', () => {
      const portfolio: Portfolio = {
        id: 1,
        name: 'Test Portfolio',
        description: 'Test Description',
        navValue: 10.0000,
        totalAum: 100000.00,
        totalUnits: 10000.0000,
        remainingCash: 5000.00,
        isActive: true,
        totalInvestors: 2,
        totalHoldings: 5,
        totalHoldingsValue: 95000.00,
        totalPortfolioValue: 100000.00,
        currentFeeAmount: 100.00,
        remainingFeeAmount: 50.00,
        feeFromDate: '2025-01-01',
        feeToDate: '2025-01-10',
        createdBy: {
          id: 1,
          username: 'admin'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      expect(portfolio).toBeDefined();
      expect(portfolio.id).toBe(1);
      expect(portfolio.name).toBe('Test Portfolio');
      expect(portfolio.navValue).toBe(10.0000);
      expect(portfolio.currentFeeAmount).toBe(100.00);
      expect(portfolio.feeFromDate).toBe('2025-01-01');
      expect(portfolio.feeToDate).toBe('2025-01-10');
    });

    it('should not have old fee percentage fields', () => {
      const portfolio: Portfolio = {
        id: 1,
        name: 'Test Portfolio',
        navValue: 10.0000,
        totalAum: 100000.00,
        totalUnits: 10000.0000,
        remainingCash: 5000.00,
        totalInvestors: 2,
        totalHoldings: 5,
        createdBy: {
          id: 1,
          username: 'admin'
        }
      };

      // These properties should not exist in the new model
      expect((portfolio as any).managementFeePercentage).toBeUndefined();
      expect((portfolio as any).entryLoadPercentage).toBeUndefined();
      expect((portfolio as any).exitLoadPercentage).toBeUndefined();
      expect((portfolio as any).brokerageBuyPercentage).toBeUndefined();
      expect((portfolio as any).brokerageSellPercentage).toBeUndefined();
    });
  });

  describe('CreatePortfolioRequest Interface', () => {
    it('should create a portfolio request with required fields only', () => {
      const request: CreatePortfolioRequest = {
        name: 'Growth Portfolio',
        description: 'High growth portfolio',
        initialNavValue: 10.0000,
        initialInvestors: [
          {
            userId: 1,
            investmentAmount: 10000.00
          }
        ]
      };

      expect(request).toBeDefined();
      expect(request.name).toBe('Growth Portfolio');
      expect(request.initialNavValue).toBe(10.0000);
      expect(request.initialInvestors.length).toBe(1);
      expect(request.initialInvestors[0].userId).toBe(1);
      expect(request.initialInvestors[0].investmentAmount).toBe(10000.00);
    });

    it('should not have old fee percentage fields', () => {
      const request: CreatePortfolioRequest = {
        name: 'Test Portfolio',
        description: 'Test Description',
        initialNavValue: 10.0000,
        initialInvestors: []
      };

      // These properties should not exist in the new model
      expect((request as any).managementFeePercentage).toBeUndefined();
      expect((request as any).entryLoadPercentage).toBeUndefined();
      expect((request as any).exitLoadPercentage).toBeUndefined();
      expect((request as any).brokerageBuyPercentage).toBeUndefined();
      expect((request as any).brokerageSellPercentage).toBeUndefined();
    });
  });

  describe('UpdatePortfolioRequest Interface', () => {
    it('should create an update request with basic fields only', () => {
      const request: UpdatePortfolioRequest = {
        name: 'Updated Portfolio Name',
        description: 'Updated description'
      };

      expect(request).toBeDefined();
      expect(request.name).toBe('Updated Portfolio Name');
      expect(request.description).toBe('Updated description');
    });

    it('should not have old fee percentage fields', () => {
      const request: UpdatePortfolioRequest = {
        name: 'Test Portfolio'
      };

      // These properties should not exist in the new model
      expect((request as any).managementFeePercentage).toBeUndefined();
      expect((request as any).entryLoadPercentage).toBeUndefined();
      expect((request as any).exitLoadPercentage).toBeUndefined();
      expect((request as any).brokerageBuyPercentage).toBeUndefined();
      expect((request as any).brokerageSellPercentage).toBeUndefined();
    });
  });

  describe('PortfolioFee Interface', () => {
    it('should create a portfolio fee object with new fee system fields', () => {
      const fee: PortfolioFee = {
        id: 1,
        portfolioId: 1,
        portfolioName: 'Test Portfolio',
        totalFeeAmount: 100.00,
        remainingFeeAmount: 50.00,
        fromDate: '2025-01-01',
        toDate: '2025-01-10',
        isActive: true,
        description: 'Monthly management fee',
        createdByUserId: 1,
        createdByUserName: 'admin',
        createdAt: '2025-01-01T00:00:00Z',
        totalDays: 10,
        remainingDays: 5,
        dailyFeeAmount: 10.00,
        allocatedFeeAmount: 50.00
      };

      expect(fee).toBeDefined();
      expect(fee.totalFeeAmount).toBe(100.00);
      expect(fee.remainingFeeAmount).toBe(50.00);
      expect(fee.fromDate).toBe('2025-01-01');
      expect(fee.toDate).toBe('2025-01-10');
      expect(fee.isActive).toBe(true);
      expect(fee.dailyFeeAmount).toBe(10.00);
      expect(fee.allocatedFeeAmount).toBe(50.00);
    });
  });

  describe('CreatePortfolioFeeRequest Interface', () => {
    it('should create a fee request with simplified fee system fields', () => {
      const request: CreatePortfolioFeeRequest = {
        totalFeeAmount: 100.00,
        fromDate: '2025-01-01',
        toDate: '2025-01-10',
        description: 'Monthly management fee'
      };

      expect(request).toBeDefined();
      expect(request.totalFeeAmount).toBe(100.00);
      expect(request.fromDate).toBe('2025-01-01');
      expect(request.toDate).toBe('2025-01-10');
      expect(request.description).toBe('Monthly management fee');
    });

    it('should support zero fee amounts', () => {
      const request: CreatePortfolioFeeRequest = {
        totalFeeAmount: 0,
        fromDate: '2025-01-01',
        toDate: '2025-01-10',
        description: 'No fee period'
      };

      expect(request.totalFeeAmount).toBe(0);
      expect(request.description).toBe('No fee period');
    });

    it('should work without description', () => {
      const request: CreatePortfolioFeeRequest = {
        totalFeeAmount: 100.00,
        fromDate: '2025-01-01',
        toDate: '2025-01-10'
      };

      expect(request.description).toBeUndefined();
    });
  });
});
