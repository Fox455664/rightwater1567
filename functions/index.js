



const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

// تهيئة Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// --- معلومات EmailJS ---
const EMAILJS_SERVICE_ID = functions.config().emailjs.service_id;
const EMAILJS_TEMPLATE_ID = functions.config().emailjs.template_id;
const EMAILJS_USER_ID = functions.config().emailjs.user_id;

// --- الدالة الأساسية لمراقبة مخزون المنتجات ---
exports.checkProductStock = functions.region("europe-west1")
    .firestore.document("products/{productId}")
    .onWrite(async (change, context) => {
      const LOW_STOCK_THRESHOLD = 5;

      const newData = change.after.data();
      if (!newData) {
        console.log("المنتج تم حذفه، لا يوجد إجراء.");
        return null;
      }

      const productName = newData.name;
      const currentStock = newData.stock;
      const oldData = change.before.data();
      const previousStock = oldData ? oldData.stock : null;

      // eslint-disable-next-line max-len
      const shouldSendNotification = currentStock <= LOW_STOCK_THRESHOLD && (previousStock === null || previousStock > LOW_STOCK_THRESHOLD);

      if (shouldSendNotification) {
        console.log(
            `انخفاض مخزون المنتج: ${productName}. المخزون الحالي: ${currentStock}`,
        );

        // --- 1. إرسال إشعار بالإيميل باستخدام EmailJS ---
        const emailjsApiUrl = "https://api.emailjs.com/api/v1.0/email/send";

        const emailData = {
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_USER_ID,
          template_params: {
            "product_name": productName,
            "current_stock": currentStock,
          },
        };

        try {
          await axios.post(emailjsApiUrl, emailData, {
            headers: {"Content-Type": "application/json"},
          });
          console.log("تم إرسال إيميل التنبيه عبر EmailJS بنجاح.");
        } catch (error) {
          console.error("حدث خطأ أثناء إرسال الإيميل عبر EmailJS.");
          if (error.response) {
            console.error("Error Body:", error.response.data);
            console.error("Error Status:", error.response.status);
          } else {
            console.error("Error Message:", error.message);
          }
        }

        // --- 2. إضافة إشعار إلى لوحة التحكم ---
        try {
          await db.collection("notifications").add({
            type: "LOW_STOCK",
            // eslint-disable-next-line max-len
            message: `مخزون المنتج "${productName}" منخفض (${currentStock} متبقي).`,
            productName: productName,
            productId: context.params.productId,
            stock: currentStock,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log("تم إنشاء إشعار في لوحة التحكم.");
        } catch (error) {
          console.error("حدث خطأ أثناء إنشاء إشعار:", error);
        }
      }

      return null;
    });


