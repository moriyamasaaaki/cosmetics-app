import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ArticleWithAuthor, Article } from '../interfaces/article';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, take, tap } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { firestore } from 'firebase';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireStorage } from '@angular/fire/storage/';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  constructor(
    private db: AngularFirestore,
    private snackBar: MatSnackBar,
    private storage: AngularFireStorage,
  ) { }

  createArticle(userId: string, article: Article, images?: File[]) {
    const articleId = this.db.createId();
    this.db.doc(`articles/${articleId}`).set({
      userId,
      articleId,
      ...article,
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now()
    })
      .then(() => {
        if (images) {
          this.uploadImages(images, articleId);
        }
        this.snackBar.open('記事を作成しました！', null, {
          duration: 2000
        });
      })
      .catch(e => {
        console.log(e);
        this.snackBar.open('記事を作成できませんでした。', null, {
          duration: 2000
        });
      });
  }

  uploadImages(files: File[], articleId: string): Promise<void> {
    return Promise.all(
      files.map((file, index) => {
        const ref = this.storage.ref(`articles/${articleId}-${index}`);
        return ref.put(file);
      })
    ).then(async urls => {
      const articleImageUrls = [];
      for (const url of urls) {
        articleImageUrls.push(await url.ref.getDownloadURL());
      }
      return this.db.doc(`articles/${articleId}`).update({
        articleImageUrls
      });
    });
  }

  getArticles(): Observable<ArticleWithAuthor[]> {
    let articles: Article[];
    return this.db.collection<Article>(`articles`).valueChanges()
      .pipe(
        switchMap((docs: Article[]) => {
          articles = docs;
          if (articles.length) {
            const userIds: string[] = articles.filter((article, index, self) => {
              return self.findIndex(item => article.userId === item.userId) === index;
            }).map(article => article.userId);

            return combineLatest(userIds.map(userId => {
              return this.db.doc<User>(`users/${userId}`).valueChanges();
            }));
          } else {
            return of([]);
          }
        }),
        map((users: User[]) => {
          return articles.map(article => {
            const result: ArticleWithAuthor = {
              ...article,
              author: users.find(user => user.userId === article.userId),
            };
            return result;
          });
        })
      );
  }

  getArticle(articleId: string): Observable<ArticleWithAuthor> {
    let result: ArticleWithAuthor;
    let article: Article;
    let author: User;
    return this.db.doc<Article>(`articles/${articleId}`)
      .valueChanges()
      .pipe(
        take(1),
        tap(doc => {
          article = doc;
        }),
        switchMap(() => {
          return this.db.doc<User>(`users/${article.userId}`)
            .valueChanges()
            .pipe(
              tap(user => {
                author = user;
              })
            );
        }),
        map(() => {
          result = {
            ...article,
            author
          };
          return result;
        })
      );
  }
}