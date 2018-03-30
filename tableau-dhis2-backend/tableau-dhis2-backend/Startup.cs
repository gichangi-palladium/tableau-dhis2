using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.IO;
using System.Reflection;

namespace tableau_dhis2_backend
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseCors(e => e.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().AllowCredentials());
            Uri uri;
            var path = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "ProxyUrl.txt");
            var log = app.ApplicationServices.GetRequiredService<ILogger<Startup>>();
            log.LogInformation($"Reading Proxy forward address from '{path}'");
           
            try
            {
              uri = new Uri(File.ReadAllText(path).Trim());
              log.LogInformation($"Forwarding to '{uri.AbsoluteUri}'");
            }
            catch(Exception e)
            {
              log.LogError($"Failed to read ProxyUrl from {path}", e);
              throw new Exception($"Failed to read ProxyUrl from {path}");
            }
            app.RunProxy(new ProxyOptions() { Scheme = uri.Scheme, Host = uri.Host, Port = uri.Port.ToString() });
            
        }
    }
}
