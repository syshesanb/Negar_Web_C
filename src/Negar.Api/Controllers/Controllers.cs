using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Negar.Application.Services;
using Negar.Domain.Entities;

namespace Negar.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService) => _authService = authService;

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AccountingController : ControllerBase
    {
        private readonly IAccountingService _accountingService;
        public AccountingController(IAccountingService accountingService) => _accountingService = accountingService;

        [HttpGet("accounts/{companyId}")]
        public async Task<ActionResult<List<SarfaslHesab>>> GetAccounts(int companyId)
        {
            return Ok(await _accountingService.GetAccountsAsync(companyId));
        }

        [HttpPost("accounts")]
        public async Task<ActionResult<SarfaslHesab>> SaveAccount([FromBody] SarfaslHesab account)
        {
            return Ok(await _accountingService.SaveAccountAsync(account));
        }

        [HttpDelete("accounts/{accountId}")]
        public async Task<IActionResult> DeleteAccount(int accountId)
        {
            var res = await _accountingService.DeleteAccountAsync(accountId);
            return Ok(res);
        }

        [HttpGet("sanad/{companyId}/{fiscalYearId}")]
        public async Task<ActionResult<List<SanadHeader>>> GetSanadList(int companyId, int fiscalYearId)
        {
            return Ok(await _accountingService.GetSanadListAsync(companyId, fiscalYearId));
        }

        [HttpPost("sanad")]
        public async Task<ActionResult<SanadHeader>> SaveSanad([FromBody] SanadHeader sanad)
        {
            return Ok(await _accountingService.SaveSanadAsync(sanad));
        }

        [HttpDelete("sanad/{entryId}")]
        public async Task<IActionResult> DeleteSanad(int entryId)
        {
            var res = await _accountingService.DeleteSanadAsync(entryId);
            return Ok(res);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;
        public InventoryController(IInventoryService inventoryService) => _inventoryService = inventoryService;

        [HttpGet("products")]
        public async Task<ActionResult<List<Product>>> GetProducts([FromQuery] int? companyId)
        {
            return Ok(await _inventoryService.GetProductsAsync(companyId));
        }

        [HttpPost("products")]
        public async Task<ActionResult<Product>> SaveProduct([FromBody] Product product)
        {
            return Ok(await _inventoryService.SaveProductAsync(product));
        }

        [HttpGet("warehouses")]
        public async Task<ActionResult<List<Warehouse>>> GetWarehouses([FromQuery] int? companyId)
        {
            return Ok(await _inventoryService.GetWarehousesAsync(companyId));
        }

        [HttpPost("warehouses")]
        public async Task<ActionResult<Warehouse>> SaveWarehouse([FromBody] Warehouse warehouse)
        {
            return Ok(await _inventoryService.SaveWarehouseAsync(warehouse));
        }

        [HttpGet("stock")]
        public async Task<ActionResult<List<InventoryRecord>>> GetStock([FromQuery] int? companyId, [FromQuery] int? warehouseId)
        {
            return Ok(await _inventoryService.GetInventoryStockAsync(companyId, warehouseId));
        }
    }
}
