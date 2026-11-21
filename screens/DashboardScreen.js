// import { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function DashboardScreen() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function loadUser() {
//       try {
//         const savedUser = await AsyncStorage.getItem('user');

//         if (savedUser) {
//           setUser(JSON.parse(savedUser));
//         }
//       } catch (error) {
//         console.log('User details error:', error.message);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadUser();
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#168344" />
//       </View>
//     );
//   }

//   if (!user) {
//     return (
//       <View style={styles.center}>
//         <Text>User details nahi milin. Dobara login karo.</Text>
//       </View>
//     );
//   }

//   const role = String(user.role || '').toLowerCase();
//   const isAdmin = role === 'admin';
//   const isSuperAdmin = role === 'superadmin';

//   const displayName =
//     user.name || user.fullName || user.email || 'Name unavailable';

//   const details = [
//     { label: 'Name', value: displayName },
//     { label: 'Email', value: user.email || 'Not available' },
//     { label: 'Role', value: isSuperAdmin ? 'Superadmin' : role || 'Not available' },
//     {
//       label: 'Account ID',
//       value: user._id || user.id || 'Not available',
//     },
//   ];

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.heading}>
//         {isSuperAdmin ? 'Superadmin Profile' : isAdmin ? 'Admin Profile': 'Invalid Role'}
//       </Text>

//       <Text style={styles.subtitle}>
//         Logged-in account details
//       </Text>

//       <View style={styles.card}>
//         <View style={styles.avatar}>
//           <Text style={styles.avatarText}>
//             {displayName.charAt(0).toUpperCase()}
//           </Text>
//         </View>

//         <Text style={styles.name}>{displayName}</Text>
//         <Text style={styles.email}>
//           {user.email || 'Email unavailable'}
//         </Text>

//         <View style={styles.divider} />

//         {details.map((item) => (
//           <View key={item.label} style={styles.detailRow}>
//             <Text style={styles.label}>{item.label}</Text>
//             <Text style={styles.value}>{item.value}</Text>
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     paddingTop: 60,
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//   },
//   heading: {
//     fontSize: 27,
//     fontWeight: '700',
//     color: '#168344',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#68756D',
//     marginTop: 6,
//     marginBottom: 24,
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 18,
//     padding: 20,
//     elevation: 3,
//   },
//   avatar: {
//     width: 76,
//     height: 76,
//     borderRadius: 38,
//     backgroundColor: '#E1F3E7',
//     justifyContent: 'center',
//     alignItems: 'center',
//     alignSelf: 'center',
//     marginBottom: 14,
//   },
//   avatarText: {
//     fontSize: 32,
//     fontWeight: '700',
//     color: '#168344',
//   },
//   name: {
//     fontSize: 21,
//     fontWeight: '700',
//     color: '#26352B',
//     textAlign: 'center',
//   },
//   email: {
//     fontSize: 14,
//     color: '#68756D',
//     textAlign: 'center',
//     marginTop: 5,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E5EBE6',
//     marginVertical: 20,
//   },
//   detailRow: {
//     marginBottom: 18,
//   },
//   label: {
//     fontSize: 12,
//     color: '#89938D',
//     marginBottom: 5,
//   },
//   value: {
//     fontSize: 15,
//     color: '#26352B',
//     fontWeight: '600',
//   },
// });






import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import api from '../services/api';

export default function DashboardScreen() {

  // Store all orders received from the backend.
  const [orders, setOrders] = useState([]);

  // Control the loading indicator.
  const [loading, setLoading] = useState(true);

  // Control pull-to-refresh.
  const [refreshing, setRefreshing] = useState(false);

  // Track backend connection status.
  const [backendStatus, setBackendStatus] = useState('Checking');


  // Fetch dashboard information from the backend.
  const fetchDashboardData = async () => {

    try {

      setBackendStatus('Checking');

      const response = await api.get('/orders/admin/all');

      const fetchedOrders = response.data.orders || [];

      setOrders(fetchedOrders);

      setBackendStatus('Connected');

    } catch (error) {

      console.log(
        'Dashboard Error:',
        error.response?.data || error.message
      );

      setBackendStatus('Disconnected');

    } finally {

      setLoading(false);

      setRefreshing(false);

    }
  };


  // Reload dashboard whenever this screen becomes active.
  useFocusEffect(
    useCallback(() => {

      fetchDashboardData();

    }, [])
  );


  // Refresh dashboard manually.
  const onRefresh = () => {

    setRefreshing(true);

    fetchDashboardData();

  };


  // Calculate order statistics.
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    order => order.orderStatus === 'Pending'
  ).length;

  const deliveredOrders = orders.filter(
    order => order.orderStatus === 'Delivered'
  ).length;

  const cancelledOrders = orders.filter(
    order => order.orderStatus === 'Cancelled'
  ).length;


  // Calculate revenue excluding cancelled orders.
  const totalRevenue = orders
    .filter(order => order.orderStatus !== 'Cancelled')
    .reduce((total, order) => {

      return total + Number(order.totalAmount || 0);

    }, 0);


  // Calculate order percentages.
  const getPercentage = value => {

    if (totalOrders === 0) {
      return 0;
    }

    return Math.round((value / totalOrders) * 100);

  };


  // Get status colors.
  const getStatusColor = status => {

    switch (status) {

      case 'Delivered':
        return '#20B879';

      case 'Cancelled':
        return '#F16A6A';

      case 'Pending':
        return '#F4B740';

      default:
        return '#6C9DFF';

    }

  };


  // Display loading screen.
  if (loading) {

    return (
      <View style={styles.loadingContainer}>

        <View style={styles.loaderCircle}>

          <ActivityIndicator
            size="large"
            color="#42D69A"
          />

        </View>

        <Text style={styles.loadingTitle}>
          Preparing your dashboard
        </Text>

        <Text style={styles.loadingSubtitle}>
          Connecting to CandyApp server...
        </Text>

      </View>
    );

  }


  // Reusable statistics card.
  const StatCard = ({ title, value, icon, color }) => {

    return (

      <View style={styles.statCard}>

        <View
          style={[
            styles.statIcon,
            { backgroundColor: color + '20' }
          ]}
        >

          <Text style={styles.statEmoji}>
            {icon}
          </Text>

        </View>

        <Text style={styles.statLabel}>
          {title}
        </Text>

        <Text style={styles.statValue}>
          {value}
        </Text>

      </View>

    );

  };


  // Reusable order progress indicator.
  const ProgressItem = ({ title, value, color }) => {

    const percentage = getPercentage(value);

    return (

      <View style={styles.progressItem}>

        <View style={styles.progressHeader}>

          <View style={styles.progressLabelContainer}>

            <View
              style={[
                styles.progressDot,
                { backgroundColor: color }
              ]}
            />

            <Text style={styles.progressTitle}>
              {title}
            </Text>

          </View>

          <Text style={styles.progressValue}>
            {value} ({percentage}%)
          </Text>

        </View>

        <View style={styles.progressBackground}>

          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: color
              }
            ]}
          />

        </View>

      </View>

    );

  };


  return (

    <ScrollView

      style={styles.screen}

      contentContainerStyle={styles.container}

      showsVerticalScrollIndicator={false}

      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#42D69A"
        />
      }

    >

      {/* HEADER */}

      <View style={styles.header}>

        <View>

          <Text style={styles.brandText}>
            CANDYAPP / MANAGEMENT
          </Text>

          <Text style={styles.headerTitle}>
            Command Center
          </Text>

          <Text style={styles.headerSubtitle}>
            Your business, under control.
          </Text>

        </View>

        <TouchableOpacity
          style={styles.headerRefresh}
          onPress={onRefresh}
          disabled={refreshing}
        >

          <Text style={styles.refreshIcon}>
            ↻
          </Text>

        </TouchableOpacity>

      </View>


      {/* BACKEND CONNECTION */}

      <View style={styles.connectionCard}>

        <View style={styles.connectionLeft}>

          <View
            style={[
              styles.connectionDot,
              {
                backgroundColor:
                  backendStatus === 'Connected'
                    ? '#42D69A'
                    : backendStatus === 'Checking'
                    ? '#F4B740'
                    : '#F16A6A'
              }
            ]}
          />

          <View>

            <Text style={styles.connectionTitle}>
              Server Status
            </Text>

            <Text style={styles.connectionSubtitle}>
              {backendStatus === 'Connected'
                ? 'Your API is responding'
                : backendStatus === 'Checking'
                ? 'Checking server response'
                : 'Unable to reach the API'}
            </Text>

          </View>

        </View>

        <Text style={styles.connectionStatus}>
          {backendStatus}
        </Text>

      </View>


      {/* MAIN ORDER INDICATOR */}

      <View style={styles.heroCard}>

        <View style={styles.heroTop}>

          <View>

            <Text style={styles.heroLabel}>
              TOTAL ORDERS
            </Text>

            <Text style={styles.heroNumber}>
              {totalOrders}
            </Text>

            <Text style={styles.heroDescription}>
              Orders received by your store
            </Text>

          </View>

          <View style={styles.orderIndicator}>

            <View style={styles.indicatorInner}>

              <Text style={styles.indicatorNumber}>
                {getPercentage(deliveredOrders)}%
              </Text>

              <Text style={styles.indicatorLabel}>
                Delivered
              </Text>

            </View>

          </View>

        </View>

        <View style={styles.heroDivider} />

        <View style={styles.heroBottom}>

          <View>

            <Text style={styles.heroBottomLabel}>
              Pending Orders
            </Text>

            <Text style={styles.heroBottomValue}>
              {pendingOrders}
            </Text>

          </View>

          <View>

            <Text style={styles.heroBottomLabel}>
              Completed Orders
            </Text>

            <Text style={styles.heroBottomValue}>
              {deliveredOrders}
            </Text>

          </View>

          <View>

            <Text style={styles.heroBottomLabel}>
              Cancelled
            </Text>

            <Text style={styles.heroBottomValue}>
              {cancelledOrders}
            </Text>

          </View>

        </View>

      </View>


      {/* BUSINESS STATISTICS */}

      <View style={styles.sectionHeader}>

        <Text style={styles.sectionTitle}>
          Business Analytics
        </Text>

        <Text style={styles.sectionTag}>
          LIVE DATA
        </Text>

      </View>


      <View style={styles.statsGrid}>

        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon="📦"
          color="#6C9DFF"
        />

        <StatCard
          title="Pending"
          value={pendingOrders}
          icon="⏳"
          color="#F4B740"
        />

        <StatCard
          title="Delivered"
          value={deliveredOrders}
          icon="✓"
          color="#20B879"
        />

        <StatCard
          title="Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          icon="₹"
          color="#A58AFF"
        />

      </View>


      {/* ORDER DISTRIBUTION */}

      <View style={styles.analyticsCard}>

        <Text style={styles.analyticsTitle}>
          Order Distribution
        </Text>

        <Text style={styles.analyticsSubtitle}>
          Track the current status of your orders.
        </Text>

        <View style={styles.progressContainer}>

          <ProgressItem
            title="Pending"
            value={pendingOrders}
            color="#F4B740"
          />

          <ProgressItem
            title="Delivered"
            value={deliveredOrders}
            color="#20B879"
          />

          <ProgressItem
            title="Cancelled"
            value={cancelledOrders}
            color="#F16A6A"
          />

        </View>

      </View>


      {/* SECURITY */}

      <View style={styles.securityCard}>

        <View style={styles.securityIcon}>

          <Text style={styles.securityEmoji}>
            🔐
          </Text>

        </View>

        <View style={styles.securityContent}>

          <Text style={styles.securityTitle}>
            Secure Admin Access
          </Text>

          <Text style={styles.securityDescription}>
            Dashboard requests use JWT authentication
            and backend role verification.
          </Text>

        </View>

      </View>


      {/* RECENT ORDERS */}

      <View style={styles.sectionHeader}>

        <Text style={styles.sectionTitle}>
          Recent Activity
        </Text>

        <Text style={styles.sectionTag}>
          LATEST 5
        </Text>

      </View>


      {orders.length === 0 ? (

        <View style={styles.emptyCard}>

          <Text style={styles.emptyEmoji}>
            📭
          </Text>

          <Text style={styles.emptyTitle}>
            No orders yet
          </Text>

          <Text style={styles.emptyDescription}>
            Customer orders will appear here when they are placed.
          </Text>

        </View>

      ) : (

        orders.slice(0, 5).map(order => (

          <View
            key={order._id}
            style={styles.orderCard}
          >

            <View style={styles.orderTop}>

              <View style={styles.orderIcon}>

                <Text style={styles.orderEmoji}>
                  📦
                </Text>

              </View>

              <View style={styles.orderInformation}>

                <Text style={styles.orderId}>
                  ORDER #{order._id.slice(-7).toUpperCase()}
                </Text>

                <Text style={styles.orderEmail}>
                  {order.userEmail || 'Customer'}
                </Text>

              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      getStatusColor(order.orderStatus) + '20'
                  }
                ]}
              >

                <Text
                  style={[
                    styles.statusText,
                    {
                      color: getStatusColor(order.orderStatus)
                    }
                  ]}
                >
                  {order.orderStatus || 'Unknown'}
                </Text>

              </View>

            </View>

            <View style={styles.orderDivider} />

            <View style={styles.orderBottom}>

              <Text style={styles.orderItems}>
                {order.totalItems || 0} Items
              </Text>

              <Text style={styles.orderAmount}>
                ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
              </Text>

            </View>

          </View>

        ))

      )}


      {/* FOOTER */}

      <View style={styles.footer}>

        <Text style={styles.footerTitle}>
          CANDYAPP
        </Text>

        <Text style={styles.footerSubtitle}>
          Store Management System
        </Text>

      </View>

    </ScrollView>

  );

}


const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#F3F7F4',
  },

  container: {
    padding: 20,
    paddingTop: 35,
    paddingBottom: 90,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#10251C',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderCircle: {
    width: 85,
    height: 85,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#285C43',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 22,
  },

  loadingSubtitle: {
    color: '#9CB9A8',
    fontSize: 12,
    marginTop: 8,
  },

  header: {
    backgroundColor: '#10251C',
    padding: 22,
    borderRadius: 23,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  brandText: {
    color: '#42D69A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 10,
  },

  headerSubtitle: {
    color: '#A4B9AC',
    fontSize: 12,
    marginTop: 5,
  },

  headerRefresh: {
    width: 43,
    height: 43,
    backgroundColor: '#264737',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  refreshIcon: {
    color: '#42D69A',
    fontSize: 28,
  },

  connectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  connectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },

  connectionTitle: {
    fontSize: 13,
    color: '#26352B',
    fontWeight: '800',
  },

  connectionSubtitle: {
    color: '#89938D',
    fontSize: 11,
    marginTop: 4,
  },

  connectionStatus: {
    color: '#168344',
    fontSize: 11,
    fontWeight: '800',
  },

  heroCard: {
    backgroundColor: '#17412D',
    borderRadius: 23,
    padding: 22,
    marginBottom: 28,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heroLabel: {
    color: '#9ECDB2',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  heroNumber: {
    color: '#FFFFFF',
    fontSize: 47,
    fontWeight: '900',
    marginTop: 7,
  },

  heroDescription: {
    color: '#B4CFBF',
    fontSize: 11,
    marginTop: 3,
  },

  orderIndicator: {
    width: 105,
    height: 105,
    borderRadius: 55,
    borderWidth: 7,
    borderColor: '#42D69A',
    borderRightColor: '#426E56',
    borderBottomColor: '#426E56',
    justifyContent: 'center',
    alignItems: 'center',
  },

  indicatorInner: {
    alignItems: 'center',
  },

  indicatorNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },

  indicatorLabel: {
    color: '#B4CFBF',
    fontSize: 9,
    marginTop: 3,
  },

  heroDivider: {
    height: 1,
    backgroundColor: '#37604A',
    marginVertical: 20,
  },

  heroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  heroBottomLabel: {
    color: '#A9C5B4',
    fontSize: 10,
  },

  heroBottomValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  sectionTitle: {
    color: '#1C3025',
    fontSize: 18,
    fontWeight: '900',
  },

  sectionTag: {
    color: '#168344',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 13,
  },

  statIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statEmoji: {
    fontSize: 19,
    color: '#26352B',
  },

  statLabel: {
    color: '#87928A',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 14,
  },

  statValue: {
    color: '#1C3025',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 5,
  },

  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 19,
    marginBottom: 20,
  },

  analyticsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#26352B',
  },

  analyticsSubtitle: {
    color: '#89938D',
    fontSize: 11,
    marginTop: 5,
  },

  progressContainer: {
    marginTop: 22,
  },

  progressItem: {
    marginBottom: 19,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  progressTitle: {
    color: '#59675E',
    fontSize: 12,
    fontWeight: '700',
  },

  progressValue: {
    color: '#26352B',
    fontSize: 11,
    fontWeight: '800',
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#EDF1ED',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: 8,
    borderRadius: 10,
  },

  securityCard: {
    backgroundColor: '#E6F5EB',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  securityIcon: {
    width: 45,
    height: 45,
    backgroundColor: '#D0EBDD',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  securityEmoji: {
    fontSize: 21,
  },

  securityContent: {
    flex: 1,
    marginLeft: 13,
  },

  securityTitle: {
    color: '#17412D',
    fontSize: 13,
    fontWeight: '900',
  },

  securityDescription: {
    color: '#52715E',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  orderCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 17,
    marginBottom: 12,
  },

  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  orderIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF5F0',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },

  orderEmoji: {
    fontSize: 19,
  },

  orderInformation: {
    flex: 1,
    marginLeft: 11,
  },

  orderId: {
    color: '#26352B',
    fontSize: 11,
    fontWeight: '900',
  },

  orderEmail: {
    color: '#89938D',
    fontSize: 10,
    marginTop: 5,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },

  orderDivider: {
    height: 1,
    backgroundColor: '#EDF1ED',
    marginVertical: 13,
  },

  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  orderItems: {
    color: '#89938D',
    fontSize: 11,
  },

  orderAmount: {
    color: '#168344',
    fontSize: 15,
    fontWeight: '900',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
  },

  emptyEmoji: {
    fontSize: 32,
  },

  emptyTitle: {
    color: '#26352B',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 12,
  },

  emptyDescription: {
    color: '#89938D',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 17,
  },

  footer: {
    alignItems: 'center',
    marginTop: 25,
  },

  footerTitle: {
    color: '#168344',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
  },

  footerSubtitle: {
    color: '#89938D',
    fontSize: 10,
    marginTop: 5,
  },

});
