using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace tableau_dhis2_backend.Controllers
{
    [Route("api")]
    public class TableauController:Controller
    {
        private Uri JoinUrl(string baseTableauUrl, string relativeUrl)
        {
            var first = baseTableauUrl.EndsWith("/") ? baseTableauUrl : baseTableauUrl + "/";
            return new Uri(new Uri(first), relativeUrl);
        }
        private async Task<IActionResult> DoTableauProxy(HttpRequestMessage request)
        {
            try
            {
                using (var c = new HttpClient(new HttpClientHandler() { AllowAutoRedirect = true, ServerCertificateCustomValidationCallback = (m, ca, ce, e) => true }))
                {
                    c.DefaultRequestHeaders.Add("Accept", "application/json");
                    if (!string.IsNullOrEmpty(Request.Headers["X-Tableau-Auth"].FirstOrDefault()))
                        c.DefaultRequestHeaders.Add("X-Tableau-Auth", Request.Headers["X-Tableau-Auth"].First());
                    var resp = await c.SendAsync(request);
                    if (!resp.IsSuccessStatusCode)
                    {
                        try
                        {
                            return StatusCode((int)resp.StatusCode, Content(await resp.Content.ReadAsStringAsync(), resp.Content.Headers.ContentType.ToString()));
                        }
                        catch
                        {
                            return StatusCode((int)resp.StatusCode);
                        }

                    }
                    return Content(await resp.Content.ReadAsStringAsync(), resp.Content.Headers.ContentType.ToString());
                }
            }
            catch (HttpRequestException)
            {
                return NotFound();
            }
            catch(Exception e)
            {
                return StatusCode(500, Json(e));
            }
           
           
        }

        public class LoginInput
        {
            public string userName { get; set; }
            public string password { get; set; }
            public string siteContentUrl { get; set; }
        }
        [HttpPost("login")]
        public async Task<IActionResult> TableauLogin(string tableauServerBaseApiUrl, [FromBody] LoginInput info)
        {
            if (!this.ModelState.IsValid)
                return BadRequest(this.ModelState);
            
            
            var postObj = new JObject(
                new JProperty("credentials", 
                new JObject(new JProperty("name", info.userName), new JProperty("password", info.password),
                new JProperty("site", new JObject(new JProperty("contentUrl", info.siteContentUrl??"")))))).ToString(Newtonsoft.Json.Formatting.Indented);
            return await DoTableauProxy(
                new HttpRequestMessage(HttpMethod.Post, JoinUrl(tableauServerBaseApiUrl, "auth/signin"))
                { Content = new StringContent(postObj, Encoding.UTF8, "application/json")});
            

        }


        [HttpGet("getProjects")]
        public async Task<IActionResult> GetProjects(string tableauServerBaseApiUrl, string siteId, int pagesize, int page)
        {
            if (!this.ModelState.IsValid)
                return BadRequest(this.ModelState);

            return await DoTableauProxy(
                new HttpRequestMessage(HttpMethod.Get, JoinUrl(tableauServerBaseApiUrl, $"sites/{siteId}/projects?pageSize={pagesize}&pageNumber={page}")));
        }
        [HttpGet("getWorkbooks")]
        public async Task<IActionResult> GetWorkbooks(string tableauServerBaseApiUrl, string siteId, int pagesize, int page)
        {
            if (!this.ModelState.IsValid)
                return BadRequest(this.ModelState);

            return await DoTableauProxy(
                new HttpRequestMessage(HttpMethod.Get, JoinUrl(tableauServerBaseApiUrl, $"sites/{siteId}/workbooks?pageSize={pagesize}&pageNumber={page}")));
        }
        [HttpGet("getWorkbookImage")]
        public async Task<IActionResult> GetWorkbookImage(string tableauServerBaseApiUrl, string siteId, string workbookId)
        {
            if (!this.ModelState.IsValid)
                return BadRequest(this.ModelState);

            return await DoTableauProxy(
                new HttpRequestMessage(HttpMethod.Get, JoinUrl(tableauServerBaseApiUrl, $"sites/{siteId}/workbooks/{workbookId}/PreviewImage")));
        }
    }
}
