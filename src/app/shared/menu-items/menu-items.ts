import { Injectable } from '@angular/core';

import { AuthService } from '../../authentication/login/auth.service';
export interface BadgeItem {
  type: string;
  value: string;
}
export interface Saperator {
  name: string;
  type?: string;
}
export interface SubChildren {
  state: string;
  name: string;
  type?: string;
}
export interface ChildrenItems {
  state: string;
  name: string;
  type?: string;
  child?: SubChildren[];
}

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
  badge?: BadgeItem[];
  saperator?: Saperator[];
  children?: ChildrenItems[];
}



@Injectable()
export class MenuItems {

   MENUITEMS:any
  constructor(private authService: AuthService){  }

  getMenuitem(): Menu[] {
   this.MENUITEMS =  this.authService.usuario.menu
    return this.MENUITEMS;
  }


}
