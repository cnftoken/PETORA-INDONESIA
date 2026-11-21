import { createClient } from "@supabase/supabase-js";

const [companyName, ownerEmail, ownerName, password] = process.argv.slice(2);

if (!companyName || !ownerEmail || !ownerName || !password) {
  console.error("Pemakaian: node scripts/setup.mjs <nama-perusahaan> <email-owner> <nama-owner> <kata-sandi>");
  process.exit(1);
}

if (password.length < 10) {
  console.error("Kata sandi harus minimal 10 karakter.");
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib tersedia.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existingCompany } = await supabase
  .from("company")
  .select("id")
  .limit(1)
  .maybeSingle();

if (existingCompany) {
  console.error("Setup awal sudah pernah dijalankan.");
  process.exit(1);
}

const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: ownerEmail,
  password,
  email_confirm: true,
  user_metadata: { display_name: ownerName },
});

if (authError) throw authError;

const { error: companyError } = await supabase
  .from("company")
  .insert({ name: companyName })
  .select("id")
  .single();
if (companyError) throw companyError;

const { data: branch, error: branchError } = await supabase
  .from("branches")
  .insert({
    code: "PUSAT",
    name: "Cabang Utama",
    timezone: "Asia/Jakarta",
  })
  .select("id")
  .single();
if (branchError) throw branchError;

const { error: userError } = await supabase
  .from("users")
  .insert({
    id: authData.user.id,
    account_type: "operational",
    display_name: ownerName,
    role: "owner",
    active: true,
    active_branch_id: branch.id,
  });
if (userError) throw userError;

const { error: assignmentError } = await supabase
  .from("branch_assignments")
  .insert({ user_id: authData.user.id, branch_id: branch.id });
if (assignmentError) throw assignmentError;

console.log(`Setup selesai. Perusahaan: ${companyName}; cabang: ${branch.code}; Owner: ${ownerEmail}`);
