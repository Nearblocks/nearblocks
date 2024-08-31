// import { getRequest } from '@/app/utils/api';
// import Transactions from './Transactions';
// import TokenTransactions from './TokenTransactions';
// import NFTTransactions from './NFTTransactions';
// import AccessKeys from './AccessKeys';
// import Overview from './Contract/Overview';
// import { Suspense } from 'react';
// import TabPanelGeneralSkeleton from '../skeleton/address/dynamicTab';
// import Link from 'next/link';
// import classNames from 'classnames';

// interface Props {
//   tab?: string;
//   cursor?: string;
//   p?: string;
//   order?: string;
// }

// // Simulated absence of the translation function
// const t = (key: string, p?: any): string | undefined => {
//   p = {};
//   const simulateAbsence = true; // Set to true to simulate absence of t
//   return simulateAbsence ? undefined : key; // Return undefined to simulate absence
// };

// export default async function AddressTabs({
//   params: { id },
//   searchParams: { tab = 'txns', cursor, p, order },
// }: {
//   params: { id: string };
//   searchParams: Props;
// }) {

//   console.log(l)
//   const parse = await getRequest(`account/${id}/contract/parse`);

//   // Function to render components based on tab value
//   const renderTabContent = (
//     id: string,
//     tab: string,
//     cursor?: string,
//     p?: string,
//     order?: string,
//   ) => {
//     switch (tab) {
//       case 'txns':
//         return (
//           <Transactions id={id} searchParams={{ tab, cursor, p, order }} />
//         );
//       case 'tokentxns':
//         return (
//           <TokenTransactions id={id} searchParams={{ tab, cursor, p, order }} />
//         );
//       case 'nfttokentxns':
//         return (
//           <NFTTransactions id={id} searchParams={{ tab, cursor, p, order }} />
//         );
//       case 'accesskeys':
//         return <AccessKeys id={id} searchParams={{ tab, cursor, p, order }} />;
//       case 'contract':
//         return <Overview id={id} searchParams={{ tab, cursor, p, order }} />;
//       // case 'comments':
//       //   return <Comments id={id} searchParams={{ tab, cursor, p, order }} />;
//       default:
//         return (
//           <Transactions id={id} searchParams={{ tab, cursor, p, order }} />
//         );
//     }
//   };

//   const tabs = [
//     { name: 'txns', label: 'Transactions' },
//     { name: 'tokentxns', label: 'Token Txns' },
//     { name: 'nfttokentxns', label: 'NFT Token Txns' },
//     { name: 'accesskeys', label: 'Access Keys' },
//     { name: 'contract', label: 'Contract' },
//   ];

//   const getClassName = (selected: boolean) =>
//     classNames(
//       'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
//       {
//         'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
//           !selected,
//         'bg-green-600 dark:bg-green-250 text-white': selected,
//       },
//     );

//   return (
//     <div className="block lg:flex lg:space-x-2 mb-10">
//       <div className="w-full ">
//         <div className="flex flex-wrap ">
//           {tabs?.map(({ name, label }) => {
//             const hasContractTab =
//               parse?.contract?.[0]?.contract &&
//               parse?.contract?.[0]?.contract?.methodNames.length > 0;

//             if (!hasContractTab && name === 'contract') return null;

//             return (
//               <Link
//                 key={name}
//                 href={`/addrs/${id}?tab=${name}&order=desc`}
//                 className={getClassName(name === tab)}
//               >
//                 <h2>
//                   {t(`address:${name}`) || label}
//                   {name === 'contract' && (
//                     <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md  -mt-3 px-1">
//                       NEW
//                     </div>
//                   )}
//                 </h2>
//               </Link>
//             );
//           })}
//         </div>
//         <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full">
//           <Suspense fallback={<TabPanelGeneralSkeleton tab={tab || 'txns'} />}>
//             {renderTabContent(id, tab, cursor, p, order)}
//           </Suspense>
//         </div>
//       </div>
//     </div>
//   );
// }

// {
//   /* <TabPanel>
//   {tab === 'comments' ? (
//     <VmComponent
//       src={components?.commentsFeed}
//       defaultSkelton={<Comment />}
//       props={{
//         network: network,
//         path: `nearblocks.io/address/${id}`,
//         limit: 10,
//         requestSignInWithWallet,
//       }}
//       loading={<Comment />}
//     />
//   ) : (
//     <div className="w-full h-[500px]"></div>
//   )}
// </TabPanel> */
// }
