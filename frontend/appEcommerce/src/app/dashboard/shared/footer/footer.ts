import { Component, OnInit } from '@angular/core';
import { FooterService } from '../../../core/services/footer.service';
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

  form: Ifooter = {
    name: '',
    desc: '',
    phone: '',
    address: '',
    facebook: '',
    github: '',
    linkedin: '',
    instagram: ''
  };

  isLoading = false;
  isSaving = false;

  constructor(private footerService: FooterService) {}

  ngOnInit(): void {
    this.loadFooter();
  }

  loadFooter() {
    this.isLoading = true;
    this.footerService.getFooter().subscribe({
      next: (res) => {
        this.form = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading footer:', err);
        this.isLoading = false;
      }
    });
  }
  submit() {
    if (this.isSaving) return;
    this.isSaving = true;
    this.footerService.updateFooter(this.form).subscribe({
      next: () => {
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error updating footer:', err);
        this.isSaving = false;
      }
    });
  }
}
