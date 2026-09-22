export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[Supabase] 接続確認をスキップしました: 環境変数が設定されていません",
    );
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabaseAnonKey },
    });

    if (!response.ok) {
      console.error(
        `[Supabase] 接続失敗: ${supabaseUrl} (status: ${response.status})`,
      );
    }
  } catch (error) {
    console.error(`[Supabase] 接続エラー: ${supabaseUrl}`, error);
  }
}
