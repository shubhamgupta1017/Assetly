// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LoginPage from './pages/LoginPage';
// import Dashboard from './pages/Dashboard';
// import MyInventory from './pages/MyInventory';
// import ItemPage from './pages/ItemPage.tsx';
// import ProductPage from './pages/ItemListing.tsx';
// import HomePage from './pages/HomePage.tsx';
// import RecordPage from './pages/Records.tsx';
// import Navbar from './components/Navbar';
// import AuthGuard from './components/AuthGuard';

// function App() {
//   return (
//     <Router>
//       <div className="bg-gray-100 min-h-screen">
//         <Navbar />
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/login" element={<LoginPage />} />

//           <Route
//             path="/dashboard"
//             element={
//               <AuthGuard>
//                 <Dashboard />
//               </AuthGuard>
//             }
//           />
//           <Route
//             path="/inventory"
//             element={
//               <AuthGuard>
//                 <MyInventory />
//               </AuthGuard>
//             }
//           />
//           <Route
//             path="/item/:id"
//             element={
//               <AuthGuard>
//                 <ItemPage />
//               </AuthGuard>
//             }
//           />
//           <Route
//             path="/products"
//             element={
//               <AuthGuard>
//                 <ProductPage />
//               </AuthGuard>
//             }
//           />
//           <Route
//             path="/records"
//             element={
//               <AuthGuard>
//                 <RecordPage />
//               </AuthGuard>
//             }
//           />

//           {/* Catch-all route for undefined paths */}
//           <Route path="*" element={<HomePage />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MyInventory from './pages/MyInventory';
import ItemPage from './pages/ItemPage.tsx';
import ProductPage from './pages/ItemListing.tsx';
import HomePage from './pages/HomePage.tsx';
import RecordPage from './pages/Records.tsx';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<MyInventory />} />
          <Route path="/item/:id" element={<ItemPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/records" element={<RecordPage />} />

          {/* Catch-all route for undefined paths */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
