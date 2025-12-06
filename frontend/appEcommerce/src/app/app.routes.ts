import { Routes } from '@angular/router';
import { NotFound } from './not-found/not-found';
import { Login } from './login/login';
import { Home as LayoutHome } from './layout/home/home';
import { Products as LayoutProducts } from './layout/products/products';
import { Account as LayoutAccount } from './layout/account/account';
import { adminGuard } from './core/guards/admin-guard';
import { Dashboard } from './dashboard/dashboard';
import { Home as DashboardHome } from './dashboard/home/home';
import { Products as DashboardProducts } from './dashboard/products/products';
import { Layout } from './layout/layout';
import { userGuard } from './core/guards/user-guard';
import { ProductDetails } from './layout/product-details/product-details';
import { Users as DashboardUsers} from './dashboard/users/users';
import { Cart } from './cart/cart';
import { Footer as DashboardFooter} from './dashboard/shared/footer/footer'
import { Footer as LayoutFooter} from './layout/shared/footer/footer'
import { accountMatchGuard } from './core/guards/account-match-guard';
import { regDeactivatGuard } from './core/guards/reg-deactivat-guard';
import { Order} from './layout/order/order'
import { Checkout } from './layout/checkout/checkout';
export const routes: Routes = [
  {path:'',component:Layout,children:[
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home',component:LayoutHome},
  { path: 'products',component:LayoutProducts},
  { path: 'account',loadComponent:()=>import('./layout/account/account').then(c=>c.Account),canMatch:[accountMatchGuard]},
  { path: 'products/:slug',component:ProductDetails},
  {path:'footer',component:LayoutFooter},
  { path: 'order', component: Order},
  {path: 'checkout',component:Checkout},
{ path: 'regest',loadComponent:()=>import('./layout/regest/regest').then(c=>c.Regest),canDeactivate:[regDeactivatGuard]},
]},
{path:'dashboard',component:Dashboard,canActivate:[adminGuard],children:[
  {path: '', component: DashboardHome},
  {path:'home',component:DashboardHome},
  {path:'products',component:DashboardProducts},
  {path:'users',component:DashboardUsers},
  {path:'footer',component:DashboardFooter},
]},
{path:'cart',component:Cart},
  {path:'login',component:Login},
  {path:'**',component:NotFound}
];
