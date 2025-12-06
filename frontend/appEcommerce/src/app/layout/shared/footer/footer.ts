import { Component, OnInit } from '@angular/core';
import { FooterService } from '../../../core/services/footer.service'
import { Ifooter } from '../../../core/models/footer.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit {

 footerData: Ifooter | null = null;
  isLoading = true;
  currentYear: number = new Date().getFullYear();

  constructor(private footerService: FooterService) {}

  ngOnInit(): void {
    this.footerService.footer$.subscribe((data) => {
      this.footerData = data;
      this.isLoading = false;
    });

    this.footerService.loadFooter();
  }
}
