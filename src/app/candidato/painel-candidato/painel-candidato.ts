import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-painel-candidato',
  templateUrl: './painel-candidato.html',
  styleUrls: ['./painel-candidato.css']
})
export class PainelCandidato implements OnInit {
  totalPartidos: number = 0;
  totalCandidatos: number = 0;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Buscar total de candidatos
    this.http.get<{ total: number }>(`${environment.apiUrl}/candidatos/total`)
      .subscribe({
        next: (resposta) => {
          console.log('Total de candidatos:', resposta.total);
          this.totalCandidatos = resposta.total;
          this.cdr.detectChanges();
        },
        error: (erro) => {
          console.error('Erro ao buscar total de candidatos:', erro);
          this.totalCandidatos = 0;
        }
      });

    // Buscar lista de candidatos para contar partidos únicos
    this.http.get<any[]>(`${environment.apiUrl}/candidatos`)
      .subscribe({
        next: (resposta) => {
          if (resposta && Array.isArray(resposta)) {
            const partidosUnicos = new Set(resposta.map(c => c.partido));
            this.totalPartidos = partidosUnicos.size;
            console.log('Total de partidos:', this.totalPartidos);
          } else {
            this.totalPartidos = 0;
          }
          this.cdr.detectChanges();
        },
        error: (erro) => {
          console.error('Erro ao buscar candidatos para contagem de partidos:', erro);
          this.totalPartidos = 0;
        }
      });
  }
}
