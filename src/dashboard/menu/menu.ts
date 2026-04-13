import { Component } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { SessaoService } from '../../app/Sessao-service/sessao.service';

@Component({
  selector: 'app-menu',
  imports: [RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu {
  //zona icons

  //zona menu
  menuFixo = true; // quando for clicado
  hover = false; // quando ter o cursor por cima

  constructor(private sessaoService: SessaoService, private router: Router) {
    console.log('Menu component criado');
  }

  //botao do menu
  toggleMenu() {
    this.menuFixo = !this.menuFixo;
  }

  logout() {
    console.log('Logout chamado');
    this.sessaoService.logout().subscribe({
      next: (response) => {
        console.log('Logout sucesso:', response);
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        console.error('Erro ao fazer logout:', err);
        // Mesmo com erro, redirecionar
        this.router.navigate(['/']);
      }
    });
  }
}
