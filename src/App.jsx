// src/App.jsx
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {ThemeProvider} from "./context/ThemeContext";
import {Header} from "./components/common/Header";
import {Home} from "./pages/Home";
import {NewMatch} from "./pages/NewMatch";
import {History} from "./pages/History";
import {Statistics} from "./pages/Statistics";
import {MatchDetails} from "./pages/MatchDetails";
import {Help} from "./pages/Help";
import {AppDataProvider} from "./context/AppDataContext";

function App() {
    return (<ThemeProvider>
            <AppDataProvider>
                <Router basename={import.meta.env.BASE_URL}>
                    <div
                        className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 text-gray-900 dark:text-gray-100">
                        <Header/>
                        <main className="pt-2 sm:pt-4 pb-20 md:pb-8 flex-grow">
                            <Routes>
                                <Route path="/" element={<Home/>}/>
                                <Route path="/new-match" element={<NewMatch/>}/>
                                <Route path="/history" element={<History/>}/>
                                <Route path="/statistics" element={<Statistics/>}/>
                                <Route path="/match/:id" element={<MatchDetails/>}/>
                                <Route path="/help" element={<Help title="Про додаток"/>}/>
                            </Routes>
                        </main>
                    </div>
                </Router>
            </AppDataProvider>
        </ThemeProvider>);
}

export default App;
