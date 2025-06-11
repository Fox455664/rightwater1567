// ... (كل الاستيرادات السابقة)
import { 
  db, 
  auth, // --- إضافة جديدة: استيراد auth ---
  collection, 
  getDocs, 
  orderBy as firestoreOrderBy, 
  query as firestoreQuery, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc 
} from '@/firebase'; 
import { sendPasswordResetEmail } from 'firebase/auth'; // --- إضافة جديدة ---
import { KeyRound } from 'lucide-react'; // --- إضافة جديدة: أيقونة كلمة المرور ---

// ... (باقي الكود كما هو)

const UserManagement = () => {
  // ... (كل الـ states كما هي)

  // ... (دوال fetchUsers, handleEditUser, etc. كما هي)

  // --- إضافة جديدة: دالة إرسال رابط إعادة تعيين كلمة المرور ---
  const handleSendPasswordReset = async (email, displayName) => {
    if (!email) {
      toast({
        title: "خطأ",
        description: "لا يوجد بريد إلكتروني مسجل لهذا المستخدم.",
        variant: "destructive",
      });
      return;
    }

    // لتأكيد الإجراء من الأدمن
    if (!window.confirm(`هل أنت متأكد أنك تريد إرسال رابط إعادة تعيين كلمة المرور إلى ${displayName} (${email})؟`)) {
      return;
    }

    try {
      // استدعاء دالة Firebase لإرسال الإيميل
      await sendPasswordResetEmail(auth, email, {
        // توجيه المستخدم لصفحة الدخول بعد تغيير كلمة المرور بنجاح
        url: `${window.location.origin}/login` 
      });

      toast({
        title: "تم الإرسال بنجاح",
        description: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}.`,
      });
    } catch (error) {
      console.error("Error sending password reset email: ", error);
      toast({
        title: "فشل الإرسال",
        description: "حدث خطأ أثناء محاولة إرسال البريد الإلكتروني. يرجى مراجعة الـ console.",
        variant: "destructive",
      });
    }
  };
  // --- نهاية الإضافة ---

  // ... (باقي الدوال كما هي)

  return (
    <motion.div /* ... */ >
      {/* ... (التحذير والبحث) */}

      {loading ? (
        // ... (شاشة التحميل)
      ) : filteredUsers.length === 0 ? (
        // ... (رسالة عدم وجود مستخدمين)
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
          <Table>
            {/* ... (رأس الجدول TableHeader) */}
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} /* ... */ >
                  {/* ... (باقي خلايا الجدول) */}
                  <TableCell className="text-center px-3 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit2 className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> تعديل
                        </DropdownMenuItem>
                        
                        {/* --- إضافة جديدة: خيار إعادة تعيين كلمة المرور --- */}
                        <DropdownMenuItem onClick={() => handleSendPasswordReset(user.email, user.displayName)}>
                          <KeyRound className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> إعادة تعيين كلمة المرور
                        </DropdownMenuItem>
                        {/* --- نهاية الإضافة --- */}

                        <DropdownMenuItem onClick={() => openDeleteModal(user)} className="text-red-600 focus:text-red-600 dark:focus:text-red-400">
                          <Trash2 className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ... (باقي المودالز للتعديل والحذف) */}
    </motion.div>
  );
};

export default UserManagement;
