import { Component } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { tap, map, concatMap } from "rxjs";
import * as XLSX from "xlsx";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "CodeSandbox";
  apiBase = "https://webexapis.com/v1/broadworks/subscribers?max=100";
  subscribersWebex: any[] = [];

  token =
    "Y2MwOTQ3NGYtNDQ2Yy00ZDhhLWI2MzItYTQyYzRlNDkxMGYwMDdhZWZjMmMtNWQ1_PE93_e198e006-171b-40f6-9199-afb6f54fe5a5";
  headers = new HttpHeaders({
    "Content-Type": "application/json",
    Authorization: `Bearer ${this.token}`
  });

  hasNext: boolean;

  private constructor(private http: HttpClient) {}

  async apiCall(offset?) {
    let api = this.apiBase;
    if (offset) api = `${this.apiBase}&offset=${offset}`;
    let httpRespose = await this.http
      .get<any>(api, { observe: "response" })
      .toPromise();
    let link = httpRespose.headers.get("link");
    this.hasNext = link && link.includes('rel="next"');
    return httpRespose.body.items;
  }

  async premi() {
    this.subscribersWebex = await this.apiCall();

    for (let i = 1; this.hasNext; i++) {
      this.subscribersWebex = this.subscribersWebex.concat(
        await this.apiCall(i * 100)
      );
    }

    const noNumber = this.subscribersWebex.filter(
      (res) => !res.primaryPhoneNumber && !res.extension
    );
    const number = this.subscribersWebex.filter(
      (res) => res.primaryPhoneNumber || res.extension
    );
    const noNumberActivated = noNumber.filter(
      (res) => res.status === "provisioned"
    );
    console.log("tot", this.subscribersWebex.length);
    console.log("noNumber", noNumber.length);
    console.log("number", number.length);
    console.log("ProvisionednoNumber", noNumberActivated.length);
    this.export(this.subscribersWebex, number, noNumber, noNumberActivated);

    /*console.log(JSON.stringify(noNumber));
    console.log(JSON.stringify(number));
    console.log(JSON.stringify(noNumberActivated));
    console.log(JSON.stringify(this.subscribersWebex));*/

    /*this.http.get<any>(this.apiBase, {headers: this.headers})
    .pipe(
      tap((res) => this.subscribersWebex = res.items),
      concatMap(() => this.http.get<any>(`${this.apiBase}&offset=${100}`, {headers: this.headers})),
      tap(res => this.subscribersWebex = this.subscribersWebex.concat(res.items))
    ).subscribe (res => console.log(this.subscribersWebex))*/
  }

  public export(tot, number, noNumber, noNumberActivated) {
    const workBook = XLSX.utils.book_new(); // create a new blank book
    const workSheetTot = XLSX.utils.json_to_sheet(tot);
    const workSheetNumber = XLSX.utils.json_to_sheet(number);
    const workSheetNoNumber = XLSX.utils.json_to_sheet(noNumber);
    const workSheetNoNumberProvisioned = XLSX.utils.json_to_sheet(
      noNumberActivated
    );

    XLSX.utils.book_append_sheet(workBook, workSheetTot, "Totale"); // add the worksheet to the book
    XLSX.utils.book_append_sheet(workBook, workSheetNumber, "Number"); // add the worksheet to the book
    XLSX.utils.book_append_sheet(workBook, workSheetNoNumber, "No Number"); // add the worksheet to the book
    XLSX.utils.book_append_sheet(
      workBook,
      workSheetNoNumberProvisioned,
      "No Number Provisioned"
    ); // add the worksheet to the book
    XLSX.writeFile(workBook, "Report.xlsx"); // initiate a file download in browser
  }
}
