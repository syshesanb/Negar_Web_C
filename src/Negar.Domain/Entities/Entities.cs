using System;
using System.Collections.Generic;

namespace Negar.Domain.Entities
{
    public class UserAccount
    {
        public int UserID { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string UserType { get; set; } = "User"; // SuperAdmin, Manager, User
        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        public string? FullName { get; set; }
        public string? CreatorIP { get; set; }
        public int MaxCompaniesAllowed { get; set; }
        public int MaxFiscalYearsPerCompany { get; set; }

        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }

    public class Permission
    {
        public int PermissionID { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public string PermissionKey { get; set; } = string.Empty;
        public string? SectionName { get; set; }
    }

    public class RolePermission
    {
        public int RolePermID { get; set; }
        public int UserID { get; set; }
        public int PermissionID { get; set; }
        public bool CanView { get; set; } = true;
        public bool CanCreate { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanPrint { get; set; }
        public bool CanExport { get; set; }

        public UserAccount? User { get; set; }
        public Permission? Permission { get; set; }
    }

    public class Company
    {
        public int CompanyID { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? CompanyCode { get; set; }
        public string? BrandName { get; set; }
        public string? EconomicCode { get; set; }
        public DateTime? FiscalYearStartDate { get; set; }
        public DateTime? FiscalYearEndDate { get; set; }
        public string? PostalCode { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? ActivityField { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Phone2 { get; set; }
        public string? Email { get; set; }
        public string? TaxID { get; set; }
        public byte[]? LogoImage { get; set; }
        public string? ChairmanName { get; set; }
        public string? InspectorName { get; set; }
        public string? CEOName { get; set; }
        public int? OwnerUserID { get; set; }
        public int AccountLevels { get; set; } = 4;
        public int Level1Length { get; set; } = 2;
        public int Level2Length { get; set; } = 2;
        public int Level3Length { get; set; } = 2;
        public int Level4Length { get; set; } = 2;
        public int Level5Length { get; set; } = 2;
        public int ProductGroupLevels { get; set; } = 3;
        public bool IsActive { get; set; } = true;

        public ICollection<FiscalYear> FiscalYears { get; set; } = new List<FiscalYear>();
    }

    public class FiscalYear
    {
        public int FiscalYearID { get; set; }
        public int CompanyID { get; set; }
        public string FiscalYearName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;

        public Company? Company { get; set; }
    }

    public class ProductGroup
    {
        public int GroupID { get; set; }
        public int CompanyID { get; set; }
        public int? ParentID { get; set; }
        public string GroupCode { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public int Level { get; set; } = 1;
        public bool IsActive { get; set; } = true;

        public ProductGroup? ParentGroup { get; set; }
        public ICollection<ProductGroup> ChildGroups { get; set; } = new List<ProductGroup>();
    }

    public class Product
    {
        public int ProductID { get; set; }
        public int? CompanyID { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Unit { get; set; } = "عدد";
        public decimal DefaultPrice { get; set; }
        public string? Category { get; set; }
        public bool IsActive { get; set; } = true;
        public int? ProductGroupID { get; set; }
        public string? Barcode { get; set; }
        public string ProductType { get; set; } = "کالا";
        public decimal PurchasePrice { get; set; }
        public decimal MinStock { get; set; }
        public decimal ReorderPoint { get; set; }
        public decimal MaxStock { get; set; }
        public string TrackingType { get; set; } = "عادی";
        public string? TechnicalName { get; set; }
        public decimal TaxPercent { get; set; }
        public decimal TollPercent { get; set; }

        public ProductGroup? ProductGroup { get; set; }
    }

    public class Warehouse
    {
        public int WarehouseID { get; set; }
        public int? CompanyID { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string? Location { get; set; }
        public bool IsActive { get; set; } = true;
        public string WarehouseType { get; set; } = "عمومی";
        public string? Phone { get; set; }
        public string? WarehouseKeeper { get; set; }
        public bool AllowNegativeStock { get; set; }
        public string? Description { get; set; }
    }

    public class InventoryRecord
    {
        public int InventoryID { get; set; }
        public int ProductID { get; set; }
        public int WarehouseID { get; set; }
        public decimal Quantity { get; set; }
        public decimal AverageCost { get; set; }
        public DateTime LastUpdate { get; set; } = DateTime.UtcNow;

        public Product? Product { get; set; }
        public Warehouse? Warehouse { get; set; }
    }

    public class PurchaseInvoice
    {
        public int InvoiceID { get; set; }
        public int? CompanyID { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
        public string? VendorName { get; set; }
        public decimal TotalAmount { get; set; }
        public int? CreatedBy { get; set; }
        public int? WarehouseID { get; set; }

        public ICollection<PurchaseInvoiceDetail> Details { get; set; } = new List<PurchaseInvoiceDetail>();
    }

    public class PurchaseInvoiceDetail
    {
        public int DetailID { get; set; }
        public int InvoiceID { get; set; }
        public int ProductID { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }

        public Product? Product { get; set; }
    }

    public class SalesInvoice
    {
        public int InvoiceID { get; set; }
        public int? CompanyID { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
        public string? CustomerName { get; set; }
        public decimal TotalAmount { get; set; }
        public int? CreatedBy { get; set; }
        public int? WarehouseID { get; set; }

        public ICollection<SalesInvoiceDetail> Details { get; set; } = new List<SalesInvoiceDetail>();
    }

    public class SalesInvoiceDetail
    {
        public int DetailID { get; set; }
        public int InvoiceID { get; set; }
        public int ProductID { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal CostAtSaleTime { get; set; }

        public Product? Product { get; set; }
    }

    public class SarfaslHesab
    {
        public int AccountID { get; set; }
        public int CompanyID { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string AccountType { get; set; } = "معین"; // گروه, کل, معین, تفصیلی
        public int? ParentAccountID { get; set; }
        public bool IsActive { get; set; } = true;
        public string AccountNature { get; set; } = "بدهکار/بستانکار"; // بدهکار, بستانکار, خنثی

        public SarfaslHesab? ParentAccount { get; set; }
        public ICollection<SarfaslHesab> ChildAccounts { get; set; } = new List<SarfaslHesab>();
    }

    public class SarfaslShenavar
    {
        public int ShenavarID { get; set; }
        public int CompanyID { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public int? ParentShenavarID { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class SanadHeader
    {
        public int EntryID { get; set; }
        public int CompanyID { get; set; }
        public int FiscalYearID { get; set; }
        public DateTime EntryDate { get; set; } = DateTime.UtcNow;
        public string? Description { get; set; }
        public string? ReferenceNumber { get; set; }
        public int? CreatedBy { get; set; }
        public decimal JamBedehkar { get; set; }
        public decimal JamBestankar { get; set; }
        public string TaeazSanad { get; set; } = "متوازن";
        public string? SharhSanad { get; set; }
        public string VazeiatSanad { get; set; } = "یادداشت"; // یادداشت, موقت, دائم
        public bool AdamVirayesh { get; set; }

        public ICollection<SanadDetail> Details { get; set; } = new List<SanadDetail>();
    }

    public class SanadDetail
    {
        public int DetailID { get; set; }
        public int EntryID { get; set; }
        public int AccountID { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public int LineNumber { get; set; }
        public int? ShenavarID { get; set; }
        public string? SharhRadif { get; set; }
        public string? TransactionNumber { get; set; }
        public string? TransactionDate { get; set; }

        public SarfaslHesab? Account { get; set; }
        public SarfaslShenavar? Shenavar { get; set; }
    }

    public class AppSetting
    {
        public int SettingID { get; set; }
        public string SettingKey { get; set; } = string.Empty;
        public string? SettingValue { get; set; }
        public string SettingCategory { get; set; } = "General";
    }

    public class ActivityLog
    {
        public int LogID { get; set; }
        public int UserID { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string? EntityType { get; set; }
        public int? EntityID { get; set; }
        public string? Description { get; set; }
        public string? IPAddress { get; set; }
        public DateTime ActivityDate { get; set; } = DateTime.UtcNow;
    }
}
