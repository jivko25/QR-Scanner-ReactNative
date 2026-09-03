import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import DefaultLayout from '../components/DefaultLayout';
import { Picker } from '@react-native-picker/picker';

const kauflandSvg = `
<svg
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   version="1.1"
   id="svg4044"
   width="768"
   height="768"
   viewBox="-18.2625 -18.2625 645.275 645.275">
  <defs
     id="defs4046" />
  <path
     id="path3958"
     style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none"
     d="m 0,0 608.75,0 0,608.75 L 0,608.75 0,0 Z" />
  <path
     id="path3960"
     style="fill:#e10915;fill-opacity:1;fill-rule:nonzero;stroke:none"
     d="m 24.11125,584.6375 560.5275,0 0,-560.53125 -560.5275,0 0,560.53125 z m 536.42125,-24.10625 -512.315,0 0,-512.31375 512.315,0 0,512.31375 z" />
  <path
     id="path3962"
     d="m 198.89648,126.57172 0,102.46094 102.46094,0 0,-102.46094 -102.46094,0 z m 120.54688,0 0,102.46094 102.46094,-102.46094 -102.46094,0 z m -120.54688,120.54297 0,102.46093 102.46094,0 0,-102.46093 -102.46094,0 z m 120.54688,0 0,102.46093 102.46094,0 -102.46094,-102.46093 z"
     style="fill:#e10915;fill-opacity:1;fill-rule:nonzero;stroke:none" />
  <path
     id="path3970"
     d="m 299.93164,408.09516 c -0.56704,10e-4 -1.1368,0.0232 -1.70508,0.0684 -5.3075,-0.38125 -10.51117,1.59554 -14.23242,5.40429 -3.715,3.80875 -5.56719,9.06383 -5.05469,14.36133 l 0,6.03125 -7.17187,0 0,11.6875 7.17187,0 0,36.5293 14.46485,0 0,-36.94922 16.45508,0 0,-11.63086 -16.45508,0 0,-4.46289 c 0,-6.025 2.83578,-9.16016 7.89453,-9.16016 l 0.0644,-0.0586 c 2.685,-0.0688 5.3268,0.66508 7.5918,2.11133 l 2.28906,-10.84961 c -3.43547,-2.02891 -7.34325,-3.09041 -11.3125,-3.08203 z m -203.49609,1.08789 0,72.99414 16.39648,0 0,-32.85157 23.92578,32.85157 18.98438,0 -28.14453,-37.31055 27.72461,-35.68359 -18.56446,0 -23.92578,33.45312 0,-33.45312 -16.39648,0 z m 221.62109,0 0,72.99023 14.4668,0 0,-72.99023 -14.4668,0 z m 180.21484,0 0,30.13867 c -4.01875,-4.21875 -9.59843,-6.59836 -15.42968,-6.56836 -13.68125,0 -22.96485,11.26914 -22.96485,25.55664 -0.4825,6.42625 1.70969,12.76414 6.05469,17.52539 4.34625,4.755 10.46516,7.50797 16.91016,7.60547 5.835,0.0738 11.43593,-2.30781 15.42968,-6.57031 l 0,5.30664 14.04297,0 0,-72.99414 -14.04297,0 z m -63.94531,23.25781 c -0.32153,-0.005 -0.64367,-0.002 -0.96679,0.01 l 0,0.0586 c -5.89376,-0.0387 -11.51844,2.46625 -15.42969,6.875 l 0,-6.03125 -14.10547,0 0,48.82422 14.16406,0 0,-31.88477 c 2.33375,-3.47125 6.24508,-5.55062 10.42383,-5.54687 2.68125,-0.15125 5.28922,0.9025 7.10547,2.875 1.82125,1.9725 2.66703,4.65429 2.30078,7.31054 l 0,27.2461 14.22266,0 0,-30.13672 c 0.43375,-5.15625 -1.3629,-10.255 -4.93164,-14 -3.35157,-3.51094 -7.9603,-5.51874 -12.78321,-5.59961 z m -257.66601,0.18945 c -13.56375,0 -22.9043,11.27039 -22.9043,25.55664 -0.48375,6.41625 1.69695,12.75086 6.0332,17.50586 4.33125,4.75125 10.4361,7.51446 16.8711,7.62696 5.56625,0.0725 10.93281,-2.10039 14.88281,-6.02539 l 0,4.88281 14.10742,0 0,-48.58008 -14.10742,0 0,5.06445 c -3.98875,-3.86625 -9.32656,-6.03125 -14.88281,-6.03125 z m 187.80664,0 c -13.56375,0 -22.9043,11.27039 -22.9043,25.55664 -0.48375,6.41625 1.69891,12.75086 6.03516,17.50586 4.33625,4.75125 10.43414,7.51446 16.86914,7.62696 5.57125,0.0725 10.93367,-2.10039 14.88867,-6.02539 l 0,4.88281 14.10156,0 0,-48.58008 -14.10156,0 0,5.06445 c -3.99375,-3.86625 -9.33117,-6.03125 -14.88867,-6.03125 z m -148.8125,0.9668 0,30.13867 c -0.43375,5.15625 1.36164,10.25305 4.93164,13.99805 3.57375,3.745 8.57961,5.77594 13.75586,5.58594 5.97125,-0.0388 11.63867,-2.65063 15.54492,-7.17188 l 0,6.0293 14.10742,0 0,-48.58008 -14.10742,0 0,31.88086 c -2.4025,3.39875 -6.26758,5.45437 -10.42383,5.54687 -2.675,0.12625 -5.2725,-0.93273 -7.09375,-2.89648 -1.82625,-1.9625 -2.69164,-4.62781 -2.36914,-7.28906 l 0,-27.24219 -14.3457,0 z m -34.41407,10.8457 c 3.93625,-0.0287 7.69149,1.64024 10.30274,4.58399 l 0,17.53906 c -2.6075,2.95 -6.36649,4.62078 -10.30274,4.58203 -7.02625,-0.47375 -12.48437,-6.30836 -12.48437,-13.34961 0,-7.04125 5.45812,-12.88172 12.48437,-13.35547 z m 187.80665,0 c 3.93624,-0.0287 7.69734,1.64024 10.30859,4.58399 l 0,17.53906 c -2.6075,2.95 -6.37235,4.62078 -10.30859,4.58203 -7.02626,-0.47375 -12.48438,-6.30836 -12.48438,-13.34961 0,-7.04125 5.45813,-12.88172 12.48438,-13.35547 z m 118.375,0.0625 c 4.2275,-0.0587 8.2371,1.86039 10.8496,5.18164 l 0,16.33789 c -2.6125,3.32 -6.6221,5.23844 -10.8496,5.17969 -7.02751,-0.4725 -12.48633,-6.30641 -12.48633,-13.34765 0,-7.04125 5.45883,-12.87782 12.48633,-13.35157 z"
     style="fill:#e10915;fill-opacity:1;fill-rule:nonzero;stroke:none" />
</svg>
`;

const lidlSvg = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
    <path fill="#0050aa" d="M0.522 0.522h58.957v58.957h-58.957z"></path>
    <path fill="#fff" d="M59.478 0.522v58.957h-58.957v-58.957h58.957zM60 0h-60v60h60v-60z"></path>
    <path fill="#fff000" d="M30 3.85c-14.442 0-26.15 11.708-26.15 26.15s11.708 26.15 26.15 26.15c14.438 0 26.144-11.702 26.15-26.139v-0.001c0-14.444-11.706-26.154-26.149-26.16h-0.001z"></path>
    <path fill="#e60a14" d="M28.377 30.736l-4.617-4.617-5.322 5.332v1.79l1.341-1.346 3.715 3.725-1.372 1.367 0.892 0.897 7.43-7.44v-1.784l-2.066 2.077z"></path>
    <path fill="#0050aa" d="M6.824 25.148h8.223v1.774h-1.372v5.739l4.763-2.65v4.857h-11.614v-1.784h1.377v-6.162h-1.377v-1.774zM41.494 25.148v1.774h1.377v6.162h-1.377v1.784h11.624v-4.857l-4.769 2.65v-5.739h1.377v-1.774h-8.233z"></path>
    <path fill="#e60a14" d="M23.082 19.623c1.616 0 2.927 1.31 2.927 2.927s-1.31 2.927-2.927 2.927c-1.616 0-2.927-1.31-2.927-2.927 0-0.004 0-0.007 0-0.011v0.001c0 0 0 0 0 0 0-1.611 1.306-2.917 2.917-2.917 0.004 0 0.007 0 0.011 0h-0.001z"></path>
    <path fill="#e60a14" d="M30 2.087c-0.002 0-0.003 0-0.005 0-15.419 0-27.918 12.499-27.918 27.918s12.499 27.918 27.918 27.918c15.417 0 27.915-12.496 27.918-27.913v-0c-0.003-15.417-12.497-27.915-27.912-27.923h-0.001zM30 56.155c-14.442 0-26.15-11.708-26.15-26.15s11.708-26.15 26.15-26.15c14.442 0 26.15 11.708 26.15 26.15 0 0.004 0 0.007 0 0.011v-0.001c-0.012 14.434-11.714 26.131-26.149 26.134h-0z"></path>
    <path fill="#0050aa" d="M36.913 25.148h-7.826v1.774h1.372v6.162h-1.388v1.784h7.826c5.812 0 5.885-9.72 0.016-9.72z"></path>
    <path fill="#fff000" d="M35.812 31.826h-0.391v-3.652h0.329c1.717 0 1.717 3.652 0.063 3.652z"></path>
</svg>
`;

const billaSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000" version="1.1"><path d="M 81.246 484.250 L 81.500 607.500 151 607.432 C 228.336 607.356, 228.412 607.351, 242.656 600.586 C 272.545 586.392, 287.312 563.576, 285.705 534.070 C 284.758 516.695, 278.875 501.728, 268.472 490.232 L 263.108 484.305 265.634 480.588 C 269.774 474.496, 274.824 463.033, 277.129 454.500 C 280.246 442.956, 280.254 424.547, 277.146 413.557 C 271.701 394.301, 258.767 377.590, 243.811 370.487 C 227.158 362.579, 208.935 361.009, 133.746 361.004 L 80.992 361 81.246 484.250 M 310 484.500 L 310 608 346 608 L 382 608 382 484.500 L 382 361 346 361 L 310 361 310 484.500 M 423.679 361.654 C 423.306 362.028, 423 417.608, 423 485.167 L 423 608 483 608 L 543 608 543 575.500 L 543 543 519.005 543 L 495.011 543 494.755 452.250 L 494.500 361.500 459.429 361.237 C 440.140 361.093, 424.053 361.280, 423.679 361.654 M 573.667 361.667 C 573.300 362.033, 573 417.608, 573 485.167 L 573 608 633 608 L 693 608 693 575.500 L 693 543 669 543 L 645 543 645 452 L 645 361 609.667 361 C 590.233 361, 574.033 361.300, 573.667 361.667 M 779.569 362.089 C 778.761 364.407, 775.137 377.763, 752.997 460 C 741.374 503.175, 727.620 553.945, 722.432 572.822 C 717.244 591.699, 713 607.336, 713 607.572 C 713 607.807, 728.672 608, 747.827 608 L 782.653 608 785.891 596.250 C 787.671 589.788, 789.355 583.712, 789.632 582.750 C 790.094 581.141, 792.225 581, 816 581 C 839.774 581, 841.906 581.141, 842.372 582.750 C 842.650 583.712, 844.312 589.788, 846.064 596.250 L 849.249 608 884.192 608 C 917.010 608, 919.102 607.894, 918.595 606.250 C 918.298 605.288, 910.600 576.150, 901.487 541.500 C 880.114 460.228, 853.736 363.402, 852.680 362.347 C 852.474 362.141, 836.050 361.681, 816.183 361.324 C 785.565 360.776, 779.986 360.892, 779.569 362.089 M 157 438.369 L 157 455 176.250 454.978 C 192.857 454.959, 196.063 454.701, 199.599 453.095 C 205.110 450.592, 208.260 445.954, 208.770 439.592 C 209.299 432.993, 206.436 428.461, 199.596 425.070 C 195.057 422.820, 193.299 422.607, 175.847 422.189 L 157 421.738 157 438.369 M 808.292 509.250 L 800.183 534.500 809.092 534.788 C 813.991 534.946, 822.004 534.946, 826.897 534.788 L 835.794 534.500 826.647 509.252 C 821.616 495.366, 817.253 484.004, 816.950 484.002 C 816.648 484.001, 812.752 495.363, 808.292 509.250 M 157 527.500 L 157 544 177.250 543.994 C 188.387 543.991, 199.152 543.530, 201.171 542.969 C 212.755 539.752, 216.308 525.108, 207.613 516.413 C 202.930 511.730, 198.831 511.012, 176.750 511.006 L 157 511 157 527.500" stroke="none" fill="#fbd304" fill-rule="evenodd"/><path d="M 0 484.503 L 0 690.002 500.250 689.751 L 1000.500 689.500 1000.752 484 L 1001.005 278.500 500.502 278.752 L 0 279.004 0 484.503 M 0.491 484.500 C 0.491 597.800, 0.607 644.002, 0.750 587.170 C 0.893 530.339, 0.893 437.639, 0.750 381.170 C 0.607 324.702, 0.491 371.200, 0.491 484.500 M 81.246 484.250 L 81.500 607.500 151 607.432 C 228.336 607.356, 228.412 607.351, 242.656 600.586 C 272.545 586.392, 287.312 563.576, 285.705 534.070 C 284.758 516.695, 278.875 501.728, 268.472 490.232 L 263.108 484.305 265.634 480.588 C 269.774 474.496, 274.824 463.033, 277.129 454.500 C 280.246 442.956, 280.254 424.547, 277.146 413.557 C 271.701 394.301, 258.767 377.590, 243.811 370.487 C 227.158 362.579, 208.935 361.009, 133.746 361.004 L 80.992 361 81.246 484.250 M 310 484.500 L 310 608 346 608 L 382 608 382 484.500 L 382 361 346 361 L 310 361 310 484.500 M 423.679 361.654 C 423.306 362.028, 423 417.608, 423 485.167 L 423 608 483 608 L 543 608 543 575.500 L 543 543 519.005 543 L 495.011 543 494.755 452.250 L 494.500 361.500 459.429 361.237 C 440.140 361.093, 424.053 361.280, 423.679 361.654 M 573.667 361.667 C 573.300 362.033, 573 417.608, 573 485.167 L 573 608 633 608 L 693 608 693 575.500 L 693 543 669 543 L 645 543 645 452 L 645 361 609.667 361 C 590.233 361, 574.033 361.300, 573.667 361.667 M 779.569 362.089 C 778.761 364.407, 775.137 377.763, 752.997 460 C 741.374 503.175, 727.620 553.945, 722.432 572.822 C 717.244 591.699, 713 607.336, 713 607.572 C 713 607.807, 728.672 608, 747.827 608 L 782.653 608 785.891 596.250 C 787.671 589.788, 789.355 583.712, 789.632 582.750 C 790.094 581.141, 792.225 581, 816 581 C 839.774 581, 841.906 581.141, 842.372 582.750 C 842.650 583.712, 844.312 589.788, 846.064 596.250 L 849.249 608 884.192 608 C 917.010 608, 919.102 607.894, 918.595 606.250 C 918.298 605.288, 910.600 576.150, 901.487 541.500 C 880.114 460.228, 853.736 363.402, 852.680 362.347 C 852.474 362.141, 836.050 361.681, 816.183 361.324 C 785.565 360.776, 779.986 360.892, 779.569 362.089 M 157 438.369 L 157 455 176.250 454.978 C 192.857 454.959, 196.063 454.701, 199.599 453.095 C 205.110 450.592, 208.260 445.954, 208.770 439.592 C 209.299 432.993, 206.436 428.461, 199.596 425.070 C 195.057 422.820, 193.299 422.607, 175.847 422.189 L 157 421.738 157 438.369 M 808.292 509.250 L 800.183 534.500 809.092 534.788 C 813.991 534.946, 822.004 534.946, 826.897 534.788 L 835.794 534.500 826.647 509.252 C 821.616 495.366, 817.253 484.004, 816.950 484.002 C 816.648 484.001, 812.752 495.363, 808.292 509.250 M 157 527.500 L 157 544 177.250 543.994 C 188.387 543.991, 199.152 543.530, 201.171 542.969 C 212.755 539.752, 216.308 525.108, 207.613 516.413 C 202.930 511.730, 198.831 511.012, 176.750 511.006 L 157 511 157 527.500" stroke="none" fill="#d40c1b" fill-rule="evenodd"/></svg>`

export default function BrochuresListScreen() {
    const navigation = useNavigation();
    const [brochures, setBrochures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState('all');
    const [showArchived, setShowArchived] = useState(false);

    useEffect(() => {
        fetchBrochures();
    }, [selectedStore, showArchived]);

    const fetchBrochures = async () => {
        setLoading(true);
        try {
            const params = {};

            if (selectedStore !== 'all') {
                params.store = selectedStore;
            }
            if (showArchived) {
                params.archived = 'true';
            }

            const res = await api.get('/brouchures', { params });
            setBrochures(res.data.brochures);
        } catch (err) {
            console.error('Грешка при зареждане на брошури:', err);
        } finally {
            setLoading(false);
        }
    };

    const openPdfExternal = (url) => {
        Linking.openURL(url).catch(err => {
            console.error('Грешка при отваряне на PDF:', err);
        });
    };

    const renderItem = ({ item }) => {
        let logoSvg = null;
        let bgColor = '#eee';

        if (item.store_name.toLowerCase().includes('kaufland')) {
            logoSvg = kauflandSvg;
            bgColor = '#E60000';
        } else if (item.store_name.toLowerCase().includes('lidl')) {
            logoSvg = lidlSvg;
            bgColor = '#003087';
        }
        else if (item.store_name.toLowerCase().includes('billa')) {
            logoSvg = billaSvg;
            bgColor = '#fbd304';
        }

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: bgColor }]}
                onPress={() => openPdfExternal(item.pdf_url)}
                activeOpacity={0.85}
            >
                <View style={styles.previewContainer}>
                    {logoSvg ? (
                        <SvgXml xml={logoSvg} width={40} height={40} />
                    ) : (
                        <Ionicons name="document-text-outline" size={40} color="#fff" />
                    )}
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.store}>{item.store_name}</Text>
                    <Text style={styles.date}>добавена: {new Date(item.created_at).toLocaleDateString('bg-BG')}</Text>
                    {item.archived && <Text style={styles.archived}>Архивирана</Text>}
                </View>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.icon} />
            </TouchableOpacity>
        );
    };

    const renderFilters = () => (
        <View style={styles.filtersContainer}>
            <Text style={styles.label}>Филтър по магазин:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedStore}
                    onValueChange={(itemValue) => setSelectedStore(itemValue)}
                    mode="dropdown"
                    dropdownIconColor="#333"
                >
                    <Picker.Item label="Всички" value="all" />
                    <Picker.Item label="Lidl" value="lidl" />
                    <Picker.Item label="Kaufland" value="kaufland" />
                    <Picker.Item label="Billa" value="billa" />
                </Picker>
            </View>

            <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setShowArchived(prev => !prev)}
            >
                <Ionicons
                    name={showArchived ? 'checkbox-outline' : 'square-outline'}
                    size={20}
                    color="#007AFF"
                />
                <Text style={styles.checkboxText}>Показвай архивирани</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <DefaultLayout>
            <View style={styles.container}>
                <Text style={styles.screenTitle}>Брошури</Text>
                <Text style={styles.screenSubtitle}>
                    PDF брошури по магазини или търсене на конкретни промоции
                </Text>

                <View style={styles.hubRow}>
                    <TouchableOpacity
                        style={[styles.hubButton, styles.hubButtonPrimary]}
                        onPress={() => navigation.navigate('BrochureProductsSearchScreen')}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="pricetags-outline" size={22} color="#fff" />
                        <Text style={styles.hubButtonText}>Търси промоции</Text>
                    </TouchableOpacity>
                </View>

                {renderFilters()}

                {loading ? (
                    <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={brochures}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 12 }}
                        ListHeaderComponent={
                            <Text style={styles.listHeader}>Текущи PDF брошури</Text>
                        }
                    />
                )}
            </View>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    screenSubtitle: {
        fontSize: 13,
        color: '#777',
        paddingHorizontal: 16,
        marginTop: 4,
        marginBottom: 10,
    },
    hubRow: {
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    hubButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
    },
    hubButtonPrimary: {
        backgroundColor: '#AD1457',
    },
    hubButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    listHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: '#555',
        marginBottom: 8,
    },
    searchPromoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 12,
        marginTop: 8,
        marginBottom: 4,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#007AFF',
    },
    searchPromoButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    filtersContainer: {
        padding: 12,
        backgroundColor: '#f9f9f9',
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#ddd',
    },
    filterButtonActive: {
        backgroundColor: '#007AFF',
    },
    filterText: {
        color: '#333',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxText: {
        marginLeft: 8,
        color: '#007AFF',
        fontWeight: '600',
    },
    card: {
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    previewContainer: {
        width: 60,
        height: 60,
        marginRight: 12,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    infoContainer: {
        flex: 1,
    },
    store: {
        fontWeight: '700',
        fontSize: 16,
        color: '#fff',
    },
    date: {
        color: '#eee',
        marginTop: 4,
        fontSize: 13,
    },
    archived: {
        marginTop: 4,
        fontSize: 12,
        fontStyle: 'italic',
        color: '#ccc',
    },
    icon: {
        marginLeft: 6,
    },
    label: {
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },

    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 12,
        overflow: 'hidden',
    },
});