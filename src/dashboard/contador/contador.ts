import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServicesBuscar } from '../../app/Comunicacao-com-backend/services-buscar';

@Component({
  selector: 'app-contador',
  imports: [CommonModule, FormsModule],
  templateUrl: './contador.html',
  styleUrl: './contador.css',
})
export class Contador implements OnInit {
  //zona icons

 /*voters = '14.5M';*/
  votersGrowth = '+2.4%';

  urns = '25,400';
  urnsOnline = '98% Online';

  complaints = '12';
  complaintsStatus = 'Pendentes';

  timeRemaining = '04:15:00';



   totalEleitores: number = 0;

  constructor(private servicesBuscar: ServicesBuscar) {}

  ngOnInit(): void {
  console.log('🟢 Contador inicializado');
  this.carregarTotalEleitores();
}

carregarTotalEleitores(): void {
  console.log('🟢 Chamando getTotalEleitoresRegistados()');
  this.servicesBuscar.getTotalEleitoresRegistados().subscribe({
    next: (res: { total: number }) => {
      console.log('✅ Resposta recebida:', res);
      this.totalEleitores = res.total;
    },
    error: (err: any) => {
      console.error('❌ Erro:', err);
      this.totalEleitores = 0;
    }
  });
}

  formatNumber(value: number): string {
    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1) + 'M';
    }
    if (value >= 1_000) {
      return (value / 1_000).toFixed(1) + 'k';
    }
    return value.toString();
  }
}
