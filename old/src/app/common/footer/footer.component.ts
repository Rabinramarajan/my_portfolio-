import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AnalyticsServiceService } from '../service/analytics/analytics-service.service';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  animations: [
    trigger("animateFooter", [
      transition(":enter", [
        query("*", [
          style({ opacity: 0, transform: "translateY(100%)" }),
          stagger(50, [
            animate(
              "250ms cubic-bezier(0.35, 0, 0.25, 1)",
              style({ opacity: 1, transform: "none" })
            )
          ])
        ])
      ])
    ])
  ]
})
export class FooterComponent implements OnInit {

  constructor(
    public analyticsService: AnalyticsServiceService,
  ) { }

  ngOnInit(): void {
  }
}
