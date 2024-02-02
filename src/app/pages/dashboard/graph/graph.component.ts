import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as ApexCharts from 'apexcharts';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
import { NewSales, NewSalesGroup } from 'src/app/interfaces/common/new-sales.interface';
import { DashboardService } from 'src/app/services/common/dashboard.service';
import { NewSalesService } from 'src/app/services/common/new-sales.service';
import { UtilsService } from 'src/app/services/core/utils.service';
import * as moment from 'moment';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

  isBrowser: boolean;
  subDataOne: any;


  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private dashboardService: DashboardService,
    private salesService: NewSalesService,
    private utilsService: UtilsService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }


  // FilterData
  filter: any = null;
  sortQuery: any = null;

  //storing data
  sales: NewSales[] = [];
  groups: any[] = [];
  dates: any;
  graphSaleCount: any;

  ngOnInit(): void {


    function getAllDaysInMonth(year, month) {
      const date = new Date(year, month, 1);

      const dates = [];

      while (date.getMonth() === month) {
        dates.push(moment(new Date(date)).format('YYYY-MM-DD'));
        date.setDate(date.getDate() + 1);
      }

      return dates;
    }

    const now = new Date();
    this.dates = getAllDaysInMonth(now.getFullYear(), now.getMonth())
    this.getAllSales();

    // const options = {
    //   series: [{
    //     name: 'Inflation',
    //     data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2]
    //   }],
    //   chart: {
    //     height: 350,
    //     type: 'bar',
    //   },
    //   plotOptions: {
    //     bar: {
    //       borderRadius: 10,
    //       dataLabels: {
    //         position: 'top', // top, center, bottom
    //       },
    //     }
    //   },
    //   dataLabels: {
    //     enabled: true,
    //     formatter: val => val + '%',
    //     offsetY: -20,
    //     style: {
    //       fontSize: '12px',
    //       colors: ['#304758']
    //     }
    //   },
    //
    //   xaxis: {
    //     categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //     position: 'top',
    //     axisBorder: {
    //       show: false
    //     },
    //     axisTicks: {
    //       show: false
    //     },
    //     crosshairs: {
    //       fill: {
    //         type: 'gradient',
    //         gradient: {
    //           colorFrom: '#D8E3F0',
    //           colorTo: '#BED1E6',
    //           stops: [0, 100],
    //           opacityFrom: 0.4,
    //           opacityTo: 0.5,
    //         }
    //       }
    //     },
    //     tooltip: {
    //       enabled: true,
    //     }
    //   },
    //   yaxis: {
    //     axisBorder: {
    //       show: false
    //     },
    //     axisTicks: {
    //       show: false,
    //     },
    //     labels: {
    //       show: false,
    //       formatter: val => val + '%'
    //     }
    //
    //   },
    //   title: {
    //     text: 'Monthly Inflation in Argentina, 2002',
    //     floating: true,
    //     offsetY: 330,
    //     align: 'center',
    //     style: {
    //       color: '#444'
    //     }
    //   }
    // };




  }


  getAllSales() {

    // this.spinner.show();
    const filter: FilterData = {
      filter: this.filter,
      pagination: null,
      select: {
        invoiceNo: 1,
        date: 1,
        customer: 1,
        salesman: 1,
        status: 1,
        soldDate: 1,
        total: 1,
        products: 1,
        subTotal: 1,
        totalPurchasePrice: 1,
        discountAmount: 1,
        soldDateString: 1,
      },
      sort: { createdAt: -1 },
    };

    this.subDataOne = this.salesService.getAllNewSales(filter, null)
      .subscribe({
        next: (res) => {
          this.sales = res.data;
          this.groups = this.utilsService.groupByField(this.sales, 'soldDateString')
          const results = [];

          this.dates.forEach(date => {
            const fData = this.groups.find(f => f['_id'] === date);
            if (fData) {
              results.push({date: fData['_id'], total: fData['data'].total, totalPurchasePrice: fData['data'].totalPurchasePrice, profit: fData['data'].profit})
            } else {
              results.push({date: date, total: 0, totalPurchasePrice: 0, profit: 0})
            }
          });

          console.log('results.map(m=> {return m.profit})', results.map(m=> {return m.profit}))
          console.log('results.map(m=> {return m.total})', results.map(m=> {return m.total}))

          // const ids = this.salesGroup.map(m => { return m._id })
          // const totalSalesCount = this.salesGroup.map(m => m.data.length)
          // const result = this.salesGroup.map((m=> {return m.data.map((m,n)=> m.total + n.total)}))

          // const result = this.salesGroup.map((m => m.data))
          // console.log(result)
          // const result2 = result.reduce((m, n) =>  )
          // const result2 = result.map(m => m.map(m2 => console.log(m2.total)));
          // const result2 = result.map (m=> );


          const options = {
            series: [
              {
                name: 'Daily Sale',
                type: 'column',
                data: results.map(m=> {return m.total})
              },
              {
                name: 'Daily Profit',
                type: 'line',
                data: results.map(m=> {return m.profit})
              }
            ],
            chart: {
              height: 380,
              width: '100%',
              type: 'line'
            },
            stroke: {
              width: [0, 3]
            },
            title: {
              text: 'Daily Sale and Profit'
            },
            dataLabels: {
              enabled: true,
              enabledOnSeries: [1]
            },
            labels:
              this.dates,
            xaxis: {
              type: 'datetime'
            },
            yaxis: [
              {
                title: {
                  text: 'Sale'
                }
              },
              {
                opposite: true,
                title: {
                  text: 'Profit'
                }
              }
            ]
          };

          if (this.isBrowser) {
            const chart = new ApexCharts(document.querySelector('#chart'), options);
            chart.render();
          }

        },
        error: (err) => {
          console.log(err)
        }
      })
  }
}
