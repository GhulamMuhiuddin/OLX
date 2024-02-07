import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { getFirestore, getDocs, setDoc, getDoc, collection, addDoc, query, doc, where, onSnapshot, serverTimestamp, orderBy, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBRoL0wtWFQpsLsOR51GvN3nCgoX8IEzgY",
  authDomain: "olx-clone-b4869.firebaseapp.com",
  projectId: "olx-clone-b4869",
  storageBucket: "olx-clone-b4869.appspot.com",
  messagingSenderId: "517440342860",
  appId: "1:517440342860:web:0db7f06a31809991b61de9",
  measurementId: "G-WNG1M7XXGW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
let userId;

const getDateFromDb = async (id) => {
  if (id) {
    const result = await getDoc(doc(db, 'products', id))
    return {
      ...result.data(),
      id: result.id
    };
  }
  else {
    const result = await getDocs(collection(db, 'products'))
    return result;
  }
};

const getUserDataFromDb = async () => {

  const res = new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {

      if (user) {

        const uid = user.uid;
        userId = uid;
        const userDataRef = doc(db, 'userInfo', uid);

        const userData = await getDoc(userDataRef);

        const obj = {
          user: true,
          userData: userData.data(),
          userId: uid
        };

        resolve(obj);

      } else {

        userId = null;

        const obj = {
          user: false,
          userData: false,
          userId: null
        };

        reject(obj);

      }
    });
  });

  return res;
};

const login = async (email, password) => {
  var result;

  await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      userId = user.id

      result = 'user is succesfully login';
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      result = errorMessage;
    });

  return result;
};

const signUp = async (name, fatherName, email, password) => {
  var result;

  await createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed in 
      const user = userCredential.user;
      userId = user.uid;

      await setDoc(doc(db, 'userInfo', user.uid), {
        firstname: name,
        lastname: fatherName,
        userImg: '',
        userEmail: user.email
      })

      result = 'user is succesfully added';
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      result = errorMessage;
    });

  return result;
};

const logout = async () => {
  await signOut(auth);
};

const getProductId = async () => {

  const res = await getDoc(doc(db, 'productId', 'XWoz6GX60rzwW6ZZSfOr'));
  const productId = res.data().productId;

  return productId;
};

const addMultiImagesInDatabase = async (image, imageNum) => {

  const productId = await getProductId();

  let storageRef = ref(storage, `productImages/${imageNum}/${productId}`);

  await uploadBytes(storageRef, image);
  const url = await getDownloadURL(storageRef);
  return url;
};

const addImageInDatabase = async (image) => {
  const productId = await getProductId();

  let storageRef = ref(storage, `productImage/${productId}`);

  await uploadBytes(storageRef, image);
  const url = await getDownloadURL(storageRef);
  return url;
};

const addDateForAdds = async (addInfo) => {

  const productId = await getProductId();

  const discountPercentage = Math.round(Math.random() * 35);
  const rating = Math.floor(Math.random() * 5);
  const images = ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3p3U7z5Gamd4oORfcHkwgLvpE-vCFM6pxpQ&usqp=CAU', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRUywYA3hf5Jaz8hzHeCzUWAAdPQ3W63dAzw&usqp=CAU'];

  const userData = await getDoc(doc(db, 'userInfo', userId));

  const obj = {
    ...addInfo,
    discountPercentage: discountPercentage,
    rating: rating,
    images: images,
    ...userData.data(),
    userId: userData.id,
    productId
  }

  await addDoc(collection(db, 'products'), obj);

  await updateDoc(doc(db, 'productId', 'XWoz6GX60rzwW6ZZSfOr'), {
    productId: productId + 1
  })
};

const addUserMsg = async (msgInfo) => {

  await addDoc(collection(db, 'usersChats'), {
    ...msgInfo,
    time: serverTimestamp()
  });

};

const getUsersMsg = async (chatId) => {

  const msgRef = query(collection(db, 'usersChats'), orderBy("time"), where("chatId", "==", chatId));

  const abc = new Promise((resolve, reject) => {
    onSnapshot(msgRef, (data) => {

      if (data.empty) {
        reject('on Chats')
      } else {
        resolve(data.docs)
      }
    })

  })

  return abc;
};

const resetPass = async (email) => {
  const res = sendPasswordResetEmail(auth, email);

  return res;
};

export { getDateFromDb, login, signUp, addDateForAdds, getUsersMsg, addImageInDatabase, logout, addUserMsg, getUserDataFromDb, resetPass, addMultiImagesInDatabase };