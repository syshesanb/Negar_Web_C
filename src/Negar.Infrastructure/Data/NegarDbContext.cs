using Microsoft.EntityFrameworkCore;
using Negar.Domain.Entities;

namespace Negar.Infrastructure.Data
{
    public class NegarDbContext : DbContext
    {
        public NegarDbContext(DbContextOptions<NegarDbContext> options) : base(options) { }

        public DbSet<UserAccount> Users { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<FiscalYear> FiscalYears { get; set; }
        public DbSet<ProductGroup> ProductGroups { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<InventoryRecord> Inventory { get; set; }
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        public DbSet<PurchaseInvoiceDetail> PurchaseInvoiceDetails { get; set; }
        public DbSet<SalesInvoice> SalesInvoices { get; set; }
        public DbSet<SalesInvoiceDetail> SalesInvoiceDetails { get; set; }
        public DbSet<SarfaslHesab> SarfaslHesab { get; set; }
        public DbSet<SarfaslShenavar> SarfaslShenavar { get; set; }
        public DbSet<SanadHeader> Sanad1 { get; set; }
        public DbSet<SanadDetail> Sanad2 { get; set; }
        public DbSet<AppSetting> AppSettings { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserAccount>().HasKey(u => u.UserID);
            modelBuilder.Entity<Permission>().HasKey(p => p.PermissionID);
            modelBuilder.Entity<RolePermission>().HasKey(rp => rp.RolePermID);
            modelBuilder.Entity<Company>().HasKey(c => c.CompanyID);
            modelBuilder.Entity<FiscalYear>().HasKey(fy => fy.FiscalYearID);
            modelBuilder.Entity<ProductGroup>().HasKey(pg => pg.GroupID);
            modelBuilder.Entity<Product>().HasKey(p => p.ProductID);
            modelBuilder.Entity<Warehouse>().HasKey(w => w.WarehouseID);
            modelBuilder.Entity<InventoryRecord>().HasKey(i => i.InventoryID);
            modelBuilder.Entity<PurchaseInvoice>().HasKey(pi => pi.InvoiceID);
            modelBuilder.Entity<PurchaseInvoiceDetail>().HasKey(pid => pid.DetailID);
            modelBuilder.Entity<SalesInvoice>().HasKey(si => si.InvoiceID);
            modelBuilder.Entity<SalesInvoiceDetail>().HasKey(sid => sid.DetailID);
            modelBuilder.Entity<SarfaslHesab>().HasKey(s => s.AccountID);
            modelBuilder.Entity<SarfaslShenavar>().HasKey(s => s.ShenavarID);
            modelBuilder.Entity<SanadHeader>().HasKey(s => s.EntryID);
            modelBuilder.Entity<SanadDetail>().HasKey(s => s.DetailID);
            modelBuilder.Entity<AppSetting>().HasKey(s => s.SettingID);
            modelBuilder.Entity<ActivityLog>().HasKey(a => a.LogID);

            modelBuilder.Entity<SarfaslHesab>()
                .HasIndex(s => new { s.CompanyID, s.AccountCode })
                .IsUnique();

            modelBuilder.Entity<SanadDetail>()
                .HasOne(d => d.Account)
                .WithMany()
                .HasForeignKey(d => d.AccountID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SanadDetail>()
                .HasOne(d => d.Shenavar)
                .WithMany()
                .HasForeignKey(d => d.ShenavarID)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
