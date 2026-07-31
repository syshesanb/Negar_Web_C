using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Negar.Domain.Entities;
using Negar.Infrastructure.Data;
using Negar.Infrastructure.Security;

namespace Negar.Application.Services
{
    // =========================================================================
    // DTO Definitions
    // =========================================================================
    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int UserID { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
    }

    public class DashboardSummary
    {
        public int TotalCompanies { get; set; }
        public int TotalUsers { get; set; }
        public int TotalProducts { get; set; }
        public int TotalWarehouses { get; set; }
        public int TotalInvoices { get; set; }
        public int TotalSanadEntries { get; set; }
        public decimal TotalSalesAmount { get; set; }
        public decimal TotalPurchaseAmount { get; set; }
    }

    // =========================================================================
    // Service Interfaces & Implementations
    // =========================================================================

    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
    }

    public class AuthService : IAuthService
    {
        private readonly NegarDbContext _db;
        public AuthService(NegarDbContext db) => _db = db;

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());
            if (user == null || !user.IsActive)
            {
                return new LoginResponse { Success = false, Message = "نام کاربری یا رمز عبور اشتباه است یا کاربر غیرفعال می‌باشد." };
            }

            if (!PasswordHasher.VerifyPassword(request.Password, user.Password))
            {
                return new LoginResponse { Success = false, Message = "نام کاربری یا رمز عبور اشتباه است." };
            }

            return new LoginResponse
            {
                Success = true,
                Message = "خوش آمدید",
                UserID = user.UserID,
                Username = user.Username,
                FullName = user.FullName ?? user.Username,
                UserType = user.UserType,
                Token = $"JWT_MOCK_TOKEN_USER_{user.UserID}_{Guid.NewGuid()}"
            };
        }
    }

    public interface IAccountingService
    {
        Task<List<SarfaslHesab>> GetAccountsAsync(int companyId);
        Task<SarfaslHesab> SaveAccountAsync(SarfaslHesab account);
        Task<bool> DeleteAccountAsync(int accountId);
        Task<List<SanadHeader>> GetSanadListAsync(int companyId, int fiscalYearId);
        Task<SanadHeader> SaveSanadAsync(SanadHeader sanad);
        Task<bool> DeleteSanadAsync(int entryId);
    }

    public class AccountingService : IAccountingService
    {
        private readonly NegarDbContext _db;
        public AccountingService(NegarDbContext db) => _db = db;

        public async Task<List<SarfaslHesab>> GetAccountsAsync(int companyId)
        {
            return await _db.SarfaslHesab
                .Where(a => a.CompanyID == companyId)
                .OrderBy(a => a.AccountCode)
                .ToListAsync();
        }

        public async Task<SarfaslHesab> SaveAccountAsync(SarfaslHesab account)
        {
            if (account.AccountID == 0)
            {
                _db.SarfaslHesab.Add(account);
            }
            else
            {
                _db.SarfaslHesab.Update(account);
            }
            await _db.SaveChangesAsync();
            return account;
        }

        public async Task<bool> DeleteAccountAsync(int accountId)
        {
            var acc = await _db.SarfaslHesab.FindAsync(accountId);
            if (acc == null) return false;
            _db.SarfaslHesab.Remove(acc);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<SanadHeader>> GetSanadListAsync(int companyId, int fiscalYearId)
        {
            return await _db.Sanad1
                .Include(s => s.Details)
                .ThenInclude(d => d.Account)
                .Where(s => s.CompanyID == companyId && s.FiscalYearID == fiscalYearId)
                .OrderByDescending(s => s.EntryID)
                .ToListAsync();
        }

        public async Task<SanadHeader> SaveSanadAsync(SanadHeader sanad)
        {
            sanad.JamBedehkar = sanad.Details.Sum(d => d.DebitAmount);
            sanad.JamBestankar = sanad.Details.Sum(d => d.CreditAmount);
            sanad.TaeazSanad = sanad.JamBedehkar == sanad.JamBestankar ? "متوازن" : "نامتوازن";

            if (sanad.EntryID == 0)
            {
                _db.Sanad1.Add(sanad);
            }
            else
            {
                _db.Sanad1.Update(sanad);
            }
            await _db.SaveChangesAsync();
            return sanad;
        }

        public async Task<bool> DeleteSanadAsync(int entryId)
        {
            var s = await _db.Sanad1.FindAsync(entryId);
            if (s == null) return false;
            _db.Sanad1.Remove(s);
            await _db.SaveChangesAsync();
            return true;
        }
    }

    public interface IInventoryService
    {
        Task<List<Product>> GetProductsAsync(int? companyId);
        Task<Product> SaveProductAsync(Product product);
        Task<List<Warehouse>> GetWarehousesAsync(int? companyId);
        Task<Warehouse> SaveWarehouseAsync(Warehouse warehouse);
        Task<List<InventoryRecord>> GetInventoryStockAsync(int? companyId, int? warehouseId);
    }

    public class InventoryService : IInventoryService
    {
        private readonly NegarDbContext _db;
        public InventoryService(NegarDbContext db) => _db = db;

        public async Task<List<Product>> GetProductsAsync(int? companyId)
        {
            var query = _db.Products.AsQueryable();
            if (companyId.HasValue) query = query.Where(p => p.CompanyID == companyId.Value);
            return await query.OrderBy(p => p.ProductCode).ToListAsync();
        }

        public async Task<Product> SaveProductAsync(Product product)
        {
            if (product.ProductID == 0) _db.Products.Add(product);
            else _db.Products.Update(product);
            await _db.SaveChangesAsync();
            return product;
        }

        public async Task<List<Warehouse>> GetWarehousesAsync(int? companyId)
        {
            var query = _db.Warehouses.AsQueryable();
            if (companyId.HasValue) query = query.Where(w => w.CompanyID == companyId.Value);
            return await query.OrderBy(w => w.WarehouseName).ToListAsync();
        }

        public async Task<Warehouse> SaveWarehouseAsync(Warehouse warehouse)
        {
            if (warehouse.WarehouseID == 0) _db.Warehouses.Add(warehouse);
            else _db.Warehouses.Update(warehouse);
            await _db.SaveChangesAsync();
            return warehouse;
        }

        public async Task<List<InventoryRecord>> GetInventoryStockAsync(int? companyId, int? warehouseId)
        {
            var query = _db.Inventory.Include(i => i.Product).Include(i => i.Warehouse).AsQueryable();
            if (warehouseId.HasValue) query = query.Where(i => i.WarehouseID == warehouseId.Value);
            return await query.ToListAsync();
        }
    }
}
