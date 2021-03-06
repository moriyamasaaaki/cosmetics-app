import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth, User } from 'firebase/app';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  afUser$: Observable<User> = this.afAuth.user;
  uid: string;
  displayName: string;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.afUser$.subscribe(user => {
      this.uid = user && user.uid;
      this.displayName = user && user.displayName;
    });
  }

  login() {
    this.afAuth.signInWithPopup(
      new auth.GoogleAuthProvider()
    )
      .then(() => {
        this.snackBar.open('ログインしました👍', null, {
          duration: 2000
        });
      })
      .catch(e => {
        console.log(e);
        this.snackBar.open('ログインに失敗しました❌', null, {
          duration: 2000
        });
      });
  }

  logout() {
    this.afAuth.signOut()
      .then(() => {
        this.snackBar.open('ログアウトしました👋', null, {
          duration: 2000
        });
        this.router.navigateByUrl('/');
      })
      .catch(e => {
        console.log(e);
        this.snackBar.open('ログアウトに失敗しました❌', null, {
          duration: 2000
        });
      });
  }
}
