new Vue({
  el: '#app',
  data: {
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
      ssdNVMe: 'SSD NVMe',
      ssdSATA: 'SSD SATA',
      hdd: 'HDD',
    },
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
    submitForm() {
      // Проверка сумм процентов
      if (this.capacitySum !== 100) {
        this.error = 'Сумма процентов в распределении емкости должна быть равна 100%.';
        this.results = null;
        return;
      }
      if (this.loadSum !== 100) {
        this.error = 'Сумма процентов в распределении нагрузки должна быть равна 100%.';
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
          this.error = `Тип диска ${this.diskNames[disk]} исключен из емкости, но имеет ненулевую нагрузку.`;
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

      // Расчет объема данных для каждого типа диска
      const capacities = {
        ssdNVMe: (capacity * capacityDistribution.ssdNVMe) / 100,
        ssdSATA: (capacity * capacityDistribution.ssdSATA) / 100,
        hdd: (capacity * capacityDistribution.hdd) / 100,
      };

      // Расчет нагрузки для каждого типа диска
      const totalIOPS = rps;
      const iopsLoad = {
        ssdNVMe: (totalIOPS * loadDistribution.ssdNVMe) / 100,
        ssdSATA: (totalIOPS * loadDistribution.ssdSATA) / 100,
        hdd: (totalIOPS * loadDistribution.hdd) / 100,
      };

      const throughputLoad = {
        ssdNVMe: (throughput * loadDistribution.ssdNVMe) / 100,
        ssdSATA: (throughput * loadDistribution.ssdSATA) / 100,
        hdd: (throughput * loadDistribution.hdd) / 100,
      };

      // Функция для расчета количества дисков
      const calculateDiskCount = (diskType) => {
        const diskCapacity = diskParameters[diskType].capacity;
        const diskIOPS = diskParameters[diskType].iops;
        const diskThroughput = diskParameters[diskType].throughput * 1000;

        const countByCapacity = Math.ceil(capacities[diskType] / diskCapacity) || 0;
        const countByIOPS = Math.ceil(iopsLoad[diskType] / diskIOPS) || 0;
        const countByThroughput = Math.ceil(throughputLoad[diskType] / diskThroughput) || 0;

        const totalDisks = Math.max(countByCapacity, countByIOPS, countByThroughput);

        const replicatedDisks = totalDisks * replicationFactor;
        const cost = replicatedDisks * diskParameters[diskType].price;

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

      return {
        disks: results,
        totalCost,
        totalReplicatedDisks,
      };
    },
  },
});
