import styles from "./page.module.css";

type ReportPageProps = {
  params?: {
    storeName?: string;
  };
  searchParams?: {
    storeName?: string;
    name?: string;
  };
};

function formatStoreName(value?: string) {
  if (!value) return "this store";

  return decodeURIComponent(value).replace(/-/g, " ");
}

export default function ReportPage({ params, searchParams }: ReportPageProps) {
  const storeName = formatStoreName(
    params?.storeName || searchParams?.storeName || searchParams?.name
  );

  return (
    <main className={styles.pageShell}>
      <section className={styles.reportCard}>
        <div className={styles.topBar}>
          <span className={styles.badge}>⚠️ Report</span>
          <p className={styles.helperText}>We review reports carefully to keep the marketplace safe.</p>
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>Submit Report</h1>
          <p className={styles.subtitle}>
            Share your concern about <span className={styles.storeName}>{storeName}</span>
          </p>

          <form className={styles.form} action="#" method="post">
            <input type="hidden" name="storeName" value={storeName} />

            <label className={styles.label} htmlFor="complaint">
              Describe the issue
            </label>
            <textarea
              id="complaint"
              name="complaint"
              className={styles.textarea}
              placeholder="Write your complaint or report here..."
              rows={8}
            />

            <button type="submit" className={styles.submitBtn}>
              Submit Report
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
