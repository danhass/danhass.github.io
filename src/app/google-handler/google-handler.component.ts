import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DtConstantsService, DTLogin } from '../dt-constants.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute } from '@angular/router';

export interface session {
  sessionId: string
}

@Component({
  selector: 'app-google-handler',
  templateUrl: './google-handler.component.html',
  styleUrls: ['./google-handler.component.less']
})

export class GoogleHandlerComponent implements OnInit {

  sessionId = "";
  justBackFromGoogle = true;
  delaySet = false;
  cycleCount = 0;
  constructor(private http: HttpClient, 
              private readonly cookies: CookieService,
              private readonly constants: DtConstantsService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  returnFromGoogle(): string {
    this.cycleCount = this.cycleCount + 1;
    console.log ("Cycle: ", this.cycleCount);
    this.justBackFromGoogle = false;
    let res = "";
    console.log("Setting 10 sec dely.", new Date().toLocaleTimeString());  
    let serviceFlag = this.cookies.get(this.constants.values().dtPlannerServiceStatusKey);
    if(serviceFlag == "initializing") {
        setTimeout(() => { 
        console.log ("Waiting for 10 seconds. ", new Date().toLocaleTimeString());
        this.delaySet = true;
        this.returnFromGoogle();
       }, 1000);
    }
    else {
      console.log("Done with delay.", new Date().toLocaleTimeString());
      console.log("Using code. ", new Date().toLocaleTimeString());
      let sentFlag = this.cookies.get("sentToGoogle");
      if (sentFlag == "true"){
        res = "back";
        let flag = this.cookies.get("sentToGoogle");
        if (flag !== 'true') {
          res = "multiple processing";
        }
        let code = this.route.snapshot.queryParamMap.get('code');
        let domain = window.location.protocol + "//" + window.location.hostname;
        if (window.location.port.length > 0) domain += ":" + window.location.port;  
        let url = this.constants.values().apiTarget +"/google?code=" + code +
        "&useCaller=true" +        
        "&domain=" + domain;        
        let session = this.http.get<DTLogin>(url).subscribe(data => {
          this.cookies.delete('sentToGoogle');          
          this.sessionId=data.session;            
          this.cookies.set(this.constants.values().dtSessionKey, data.session, 7);          
          window.location.href = domain;      
        });
      }
    }      
    return res;
  }
}
