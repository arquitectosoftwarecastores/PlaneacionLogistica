import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {NgFor} from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

export interface UserData {
  numero: string;
  personal: string;
  sistema: string;
  tipoUsuario: string;
  roles: string;
}

/** Constants used to fill up our data base. */
const NUMERO: string[] = [
  'blueberry',

];

const PERSONAL: string[] = [
  'blueberry',
];
const SISTEMA: string[] = [
  'Maia',
];
const TIPOUSUARIO: string[] = [
  'Maia',
];

const ROLES: string[] = [
  'Maia',
];

@Component({
  selector: 'app-alta-usuarios',
  templateUrl: './alta-usuarios.component.html',
  styleUrls: ['./alta-usuarios.component.css'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatDialogModule,
            CdkDropListGroup, CdkDropList, NgFor, CdkDrag]
})
export class AltaUsuariosComponent {
  displayedColumns: string[] = ['numero', 'personal', 'sistema', 'tipoUsuario', 'roles'];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('dialogRoles') dialogRoles!: TemplateRef<any>;

  constructor(public dialog: MatDialog) {
    const users = Array.from({ length: 100 }, (_, k) => createNewUser(k + 1));
    this.dataSource = new MatTableDataSource(users);
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(this.dialogTemplate);

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openDialogPermisos(): void {
    const dialogRol = this.dialog.open(this.dialogRoles);

    dialogRol.afterClosed().subscribe(result => {
    });
  }

  oncloseDialog(): void {
    this.dialog.closeAll();

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  items = ['Prueba 1', 'Administrador'];

  basket = ['TI'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
function createNewUser(id: number): UserData {
  const numero =
    NUMERO[Math.round(Math.random() * (NUMERO.length - 1))] +
    ' ' +
    NUMERO[Math.round(Math.random() * (NUMERO.length - 1))].charAt(0) +
    '.';

  const personal = PERSONAL[Math.round(Math.random() * (PERSONAL.length - 1))] +
    ' ' +
    PERSONAL[Math.round(Math.random() * (PERSONAL.length - 1))].charAt(0) +
    '.';

  const sistema = SISTEMA[Math.round(Math.random() * (SISTEMA.length - 1))] +
    ' ' +
    SISTEMA[Math.round(Math.random() * (SISTEMA.length - 1))].charAt(0) +
    '.';
  const tipoUsuario = TIPOUSUARIO[Math.round(Math.random() * (TIPOUSUARIO.length - 1))] +
    ' ' +
    TIPOUSUARIO[Math.round(Math.random() * (TIPOUSUARIO.length - 1))].charAt(0) +
    '.';
  const roles = ROLES[Math.round(Math.random() * (ROLES.length - 1))] +
    ' ' +
    ROLES[Math.round(Math.random() * (ROLES.length - 1))].charAt(0) +
    '.';


  return {
    numero: numero,
    personal: personal,
    sistema: sistema,
    tipoUsuario: tipoUsuario,
    roles: roles,
  };
}
