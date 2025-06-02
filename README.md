# Tutorial Tester

Test your tutorials and guides in CI.

```yml
    - name: Run test for ${{ matrix.tutorial }}
      uses: sarahschwartz/tutorial-tester@main
      with:
        tutorial-paths: '["zk-stack/prividium/run-prividium-chain"]'
        config-path: 'tests/erc20-paymaster.ts'
        folder-name: 'prividium'
        wait-time: 100000
```

## Debugging Locally

You can run this action locally using [`act`](https://github.com/nektos/act).

```bash
act -j '<YOUR_WORKFLOW_NAME>' --container-architecture linux/amd64
```

You can find the test output files in the generated Docker container
under `/run/act/actions/sarahschwartz-tutorial-tester@main`.
