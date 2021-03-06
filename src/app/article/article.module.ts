import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArticleRoutingModule } from './article-routing.module';
import { ArticleComponent } from './article/article.component';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button';
@NgModule({
  declarations: [ArticleComponent],
  imports: [
    CommonModule,
    ArticleRoutingModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatDialogModule,
    MatButtonModule
  ]
})
export class ArticleModule { }
