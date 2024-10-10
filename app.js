// app.js

new Vue({
  el: '#app',
  data: {
    currentLanguage: 'ru',
    translations: {
      ru: {
        language: 'Язык',
        disks: 'дисков',
        calculationsFor: 'Расчет для',
        totalDataVolume: 'Общий объем данных',
        totalIOPS: 'Общий IOPS',
        maxOfAbove: 'максимум из вышеуказанных',
        costFor: 'Стоимость для',
        appTitle: 'Калькулятор ресурсов распределенного хранилища',
        section1Title: '1. Входные параметры',
        rps: 'RPS (запросов в секунду)',
        capacity: 'Общий объем данных (ТБ)',
        throughput: 'Пропускная способность (ГБ/с)',
        section2Title: '2. Распределение емкости (%)',
        ssdNVMe: 'SSD NVMe',
        ssdSATA: 'SSD SATA',
        hdd: 'HDD',
        sum: 'Сумма',
        tb: 'ТБ',
        gbs: 'ГБ/с',
        section3Title: '3. Распределение нагрузки (%)',
        section4Title: '4. Параметры дисков',
        diskCapacity: 'Емкость диска (ТБ)',
        diskIOPS: 'IOPS',
        diskThroughput: 'Пропускная способность (МБ/с)',
        diskPrice: 'Стоимость ($)',
        section5Title: '5. Коэффициент репликации',
        replicationFactor: 'Replication Factor',
        calculate: 'Рассчитать',
        detailedCalculations: 'Детальные расчеты',
        calculationResults: 'Результаты расчета',
        parameter: 'Параметр',
        dataVolume: 'Объем данных (ТБ)',
        iopsLoad: 'Нагрузка IOPS',
        throughputLoad: 'Нагрузка Throughput (ГБ/с)',
        countByCapacity: 'Кол-во дисков по емкости',
        countByThroughput: 'Кол-во дисков по Throughput',
        countByIOPS: 'Кол-во дисков по IOPS',
        totalDisks: 'Итоговое кол-во дисков',
        replicatedDisks: 'Кол-во дисков с репликацией',
        cost: 'Стоимость ($)',
        totalCost: 'Общая стоимость',
        totalReplicatedDisks: 'Общее количество дисков с репликацией',
        errorCapacitySum: 'Сумма процентов в распределении емкости должна быть равна 100%.',
        errorLoadSum: 'Сумма процентов в распределении нагрузки должна быть равна 100%.',
        errorExcludedDisk: 'Тип диска {disk} исключен из емкости, но имеет ненулевую нагрузку.',
      },
      en: {
        language: 'Language',
        disks: 'disks',
        calculationsFor: 'Calculations for',
        totalDataVolume: 'Total Data Volume',
        totalIOPS: 'Total IOPS',
        maxOfAbove: 'maximum of the above',
        costFor: 'Cost for',
        appTitle: 'Distributed Storage Resource Calculator',
        section1Title: '1. Input Parameters',
        rps: 'RPS (Requests Per Second)',
        capacity: 'Total Data Volume (TB)',
        throughput: 'Throughput (GB/s)',
        section2Title: '2. Capacity Distribution (%)',
        ssdNVMe: 'SSD NVMe',
        ssdSATA: 'SSD SATA',
        hdd: 'HDD',
        sum: 'Sum',
        tb: 'TB',
        gbs: 'GB/s',
        section3Title: '3. Load Distribution (%)',
        section4Title: '4. Disk Parameters',
        diskCapacity: 'Disk Capacity (TB)',
        diskIOPS: 'IOPS',
        diskThroughput: 'Throughput (MB/s)',
        diskPrice: 'Price ($)',
        section5Title: '5. Replication Factor',
        replicationFactor: 'Replication Factor',
        calculate: 'Calculate',
        detailedCalculations: 'Detailed Calculations',
        calculationResults: 'Calculation Results',
        parameter: 'Parameter',
        dataVolume: 'Data Volume (TB)',
        iopsLoad: 'IOPS Load',
        throughputLoad: 'Throughput Load (GB/s)',
        countByCapacity: 'Disks by Capacity',
        countByThroughput: 'Disks by Throughput',
        countByIOPS: 'Disks by IOPS',
        totalDisks: 'Total Disks',
        replicatedDisks: 'Disks with Replication',
        cost: 'Cost ($)',
        totalCost: 'Total Cost',
        totalReplicatedDisks: 'Total Disks with Replication',
        errorCapacitySum: 'The sum of capacity distribution percentages must be 100%.',
        errorLoadSum: 'The sum of load distribution percentages must be 100%.',
        errorExcludedDisk: 'Disk type {disk} is excluded from capacity but has non-zero load.',
      },
    },
    formData: {
      rps: null,
      capacity: null,
      throughput: null,
      capacityDistribution: {
        ssdNVMe: 0,
        ssdSATA: 0,
        hdd: 0,
      },
      loadDistribution: {
        ssdNVMe: 0,
        ssdSATA: 0,
        hdd: 0,
      },
      diskParameters: {
        ssdNVMe: {
          capacity: 4,
          iops: 10000,
          throughput: 3000,
          price: 800,
        },
        ssdSATA: {
          capacity: 6,
          iops: 1000,
          throughput: 500,
          price: 600,
        },
        hdd: {
          capacity: 8,
          iops: 100,
          throughput: 100,
          price: 200,
        },
      },
      replicationFactor: 3,
    },
    results: null,
    error: null,
    diskNames: {
      ssdNVMe: '',
      ssdSATA: '',
      hdd: '',
    },
    detailedCalculations: [],
  },
  computed: {
    capacitySum() {
      const sum =
        this.formData.capacityDistribution.ssdNVMe +
        this.formData.capacityDistribution.ssdSATA +
        this.formData.capacityDistribution.hdd;
      return sum;
    },
    loadSum() {
      const sum =
        this.formData.loadDistribution.ssdNVMe +
        this.formData.loadDistribution.ssdSATA +
        this.formData.loadDistribution.hdd;
      return sum;
    },
  },
  methods: {
    t(key) {
      return this.translations[this.currentLanguage][key];
    },
    changeLanguage(skipCalc) {
      // Обновление названий дисков при смене языка
      this.diskNames = {
        ssdNVMe: this.t('ssdNVMe'),
        ssdSATA: this.t('ssdSATA'),
        hdd: this.t('hdd'),
      };
      // Обновление заголовка страницы
      document.title = this.t('appTitle');
      if (skipCalc) {
        return;
      }

      // Выполнение расчетов
      try {
        this.results = this.calculateResults();
        console.log('recalculated')
      } catch (err) {
        this.results = null;
        console.log('error:', err)
      }
    },
    submitForm() {
      // Проверка сумм процентов
      if (this.capacitySum !== 100) {
        this.error = this.t('errorCapacitySum');
        this.results = null;
        return;
      }
      if (this.loadSum !== 100) {
        this.error = this.t('errorLoadSum');
        this.results = null;
        return;
      }

      // Проверка исключенных дисков
      const excludedDisks = [];
      if (this.formData.capacityDistribution.ssdNVMe === 0) excludedDisks.push('ssdNVMe');
      if (this.formData.capacityDistribution.ssdSATA === 0) excludedDisks.push('ssdSATA');
      if (this.formData.capacityDistribution.hdd === 0) excludedDisks.push('hdd');

      for (const disk of excludedDisks) {
        if (this.formData.loadDistribution[disk] !== 0) {
          const errorMessage = this.t('errorExcludedDisk').replace('{disk}', this.diskNames[disk]);
          this.error = errorMessage;
          this.results = null;
          return;
        }
      }

      this.error = null;

      // Выполнение расчетов
      try {
        this.results = this.calculateResults();
      } catch (err) {
        this.error = err.message;
        this.results = null;
      }
    },
    calculateResults() {
      const {
        rps,
        capacity,
        throughput,
        capacityDistribution,
        loadDistribution,
        diskParameters,
        replicationFactor,
      } = this.formData;

      // Инициализация детальных расчетов
      this.detailedCalculations = [];

      // Общий объем данных
      this.detailedCalculations.push(`${this.t('totalDataVolume')}: ${capacity} ${this.t('tb')}`);

      // Расчет объема данных для каждого типа диска
      const capacities = {};
      ['ssdNVMe', 'ssdSATA', 'hdd'].forEach((diskType) => {
        const percent = capacityDistribution[diskType];
        capacities[diskType] = (capacity * percent) / 100;
        if (percent > 0) {
          this.detailedCalculations.push(
            `${this.t('dataVolume')} (${this.diskNames[diskType]}): ${capacity} ${this.t('tb')} * ${percent}% = ${capacities[diskType].toFixed(2)} ${this.t('tb')}`
          );
        }
      });

      // Общий IOPS
      const totalIOPS = rps;
      this.detailedCalculations.push(`\n${this.t('totalIOPS')}: ${totalIOPS} IOPS`);

      const iopsLoad = {};
      const throughputLoad = {};

      ['ssdNVMe', 'ssdSATA', 'hdd'].forEach((diskType) => {
        const percent = loadDistribution[diskType];
        iopsLoad[diskType] = (totalIOPS * percent) / 100;
        throughputLoad[diskType] = (throughput * percent) / 100;
        if (percent > 0) {
          this.detailedCalculations.push(
            `${this.t('iopsLoad')} (${this.diskNames[diskType]}): ${totalIOPS} IOPS * ${percent}% = ${iopsLoad[diskType].toFixed(2)} IOPS`
          );
          this.detailedCalculations.push(
            `${this.t('throughputLoad')} (${this.diskNames[diskType]}): ${throughput} ${this.t('gbs')} * ${percent}% = ${throughputLoad[diskType].toFixed(2)} ${this.t('gbs')}`
          );
        }
      });

      // Функция для расчета количества дисков
      const calculateDiskCount = (diskType) => {
        const diskCapacity = diskParameters[diskType].capacity;
        const diskIOPS = diskParameters[diskType].iops;
        const diskThroughputGB = diskParameters[diskType].throughput / 1000;

        const countByCapacity = Math.ceil(capacities[diskType] / diskCapacity) || 0;
        const countByIOPS = Math.ceil(iopsLoad[diskType] / diskIOPS) || 0;
        const countByThroughput = Math.ceil(throughputLoad[diskType] / diskThroughputGB) || 0;

        const totalDisks = Math.max(countByCapacity, countByIOPS, countByThroughput);

        const replicatedDisks = totalDisks * replicationFactor;
        const cost = replicatedDisks * diskParameters[diskType].price;

        // Детальные расчеты для текущего типа диска
        this.detailedCalculations.push(`\n${this.t('calculationsFor')} ${this.diskNames[diskType]}:`);
        this.detailedCalculations.push(
          `${this.t('countByCapacity')}: ${capacities[diskType].toFixed(2)} ${this.t('tb')} / ${diskCapacity} ${this.t('tb')} = ${countByCapacity} ${this.t('disks')}`
        );
        this.detailedCalculations.push(
          `${this.t('countByIOPS')}: ${iopsLoad[diskType].toFixed(2)} IOPS / ${diskIOPS} IOPS = ${countByIOPS} ${this.t('disks')}`
        );
        this.detailedCalculations.push(
          `${this.t('countByThroughput')}: ${throughputLoad[diskType].toFixed(2)} ${this.t('gbs')} / ${diskThroughputGB} ${this.t('gbs')} = ${countByThroughput} ${this.t('disks')}`
        );
        this.detailedCalculations.push(
          `${this.t('totalDisks')} (${this.t('maxOfAbove')}): max(${countByCapacity}, ${countByIOPS}, ${countByThroughput}) = ${totalDisks} ${this.t('disks')}`
        );
        this.detailedCalculations.push(
          `${this.t('replicatedDisks')}: ${totalDisks} * ${replicationFactor} = ${replicatedDisks} ${this.t('disks')}`
        );
        this.detailedCalculations.push(
          `${this.t('costFor')} ${this.diskNames[diskType]}: ${replicatedDisks} ${this.t('disks')} * ${diskParameters[diskType].price} \$ = ${cost.toFixed(2)} \$`
        );

        return {
          diskType,
          capacity: capacities[diskType],
          iopsLoad: iopsLoad[diskType],
          throughputLoad: throughputLoad[diskType],
          countByCapacity,
          countByIOPS,
          countByThroughput,
          totalDisks,
          replicatedDisks,
          cost,
        };
      };

      const results = [];

      ['ssdNVMe', 'ssdSATA', 'hdd'].forEach((diskType) => {
        if (capacityDistribution[diskType] > 0) {
          results.push(calculateDiskCount(diskType));
        }
      });

      // Общие итоги
      const totalCost = results.reduce((sum, disk) => sum + disk.cost, 0);
      const totalReplicatedDisks = results.reduce(
        (sum, disk) => sum + disk.replicatedDisks,
        0
      );

      this.detailedCalculations.push(`\n${this.t('totalCost')}: ${totalCost.toFixed(2)} \$`);
      this.detailedCalculations.push(`${this.t('totalReplicatedDisks')}: ${totalReplicatedDisks} ${this.t('disks')}`);

      return {
        disks: results,
        totalCost,
        totalReplicatedDisks,
      };
    },
  },
  mounted() {
    // Установка начальных названий дисков
    this.changeLanguage(true);
  },
});
