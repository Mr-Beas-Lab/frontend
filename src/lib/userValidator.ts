import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export const validateUser = async () => {
  if (!auth.currentUser) {
    console.error("User not authenticated");
    return false;
  }

  try {
    const userRef = doc(db, "stafs", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log("User is valid:", userSnap.data());
      return userSnap.data();
    } else {
      console.error("User not found in Firestore");
      return false;
    }
  } catch (error:any) {
    console.error("Error validating user:", error.message);
    return false;
  }
};

// Example Usage
validateUser();
