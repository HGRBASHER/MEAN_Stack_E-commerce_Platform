import { Component, OnInit } from '@angular/core';
import { Footer } from "./shared/footer/footer";
import { Header } from "./shared/header/header";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from '../core/services/auth.service';
import { Home } from "./home/home";
import { Products } from "./products/products";

@Component({
  selector: 'app-layout',
  imports: [Footer, Header, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
