import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesBuscar } from '../../app/Comunicacao-com-backend/services-buscar';

@Component({
  selector: 'app-participacao-global',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './participacao-global.html',
  styleUrl: './participacao-global.css',
})
export class ParticipacaoGlobal implements OnInit {

  afluencia: number = 0;
  votaram: number = 0;
  abstencao: number = 0;
  strokeDashoffset: number = 200;

  constructor(private servicesBuscar: ServicesBuscar) {}

  ngOnInit() {
    this.buscarDadosParticipacao();
  }

  buscarDadosParticipacao() {
    this.servicesBuscar.buscarParticipacaoGlobal().subscribe({
      next: (data: any) => {
        this.afluencia = data.afluencia || 0;
        this.votaram = data.votaram || 0;
        this.abstencao = data.abstencao || 0;
        this.atualizarCirculo();
      },
      error: (err: any) => {
        console.error('Erro ao buscar dados de participação:', err);
      }
    });
  }

  atualizarCirculo() {
    const circumference = 2 * Math.PI * 80;
    this.strokeDashoffset = circumference - (this.afluencia / 100) * circumference;
  }
}
