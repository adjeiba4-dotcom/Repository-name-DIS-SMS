import AppRouter from "./routes/AppRouter";
import { AppToaster } from "./components/ui/Toast";

function App() {
  return (
    <>
      <AppRouter />
      <AppToaster />
    </>
  );
}

export default App;
