import { v4 as uuidv4 } from 'uuid';
import { executeCodeInSandbox, gradeSubmission } from './runner.js';
import { db } from './database.js';
import { wrapCodeWithHarness } from './leetcodeRegistry.js';
import { analyzeComplexity } from './complexityAnalyzer.js';

class ExecutionQueue {
  constructor(concurrency = 4) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
    this.jobs = new Map(); // id -> job details & result
    this.subscribers = new Map(); // id -> callback functions
  }

  enqueue({ type, teamName, memberId, problemId, lang, code, stdin = '' }) {
    const id = uuidv4();
    const job = {
      id,
      type, // 'run' or 'submit'
      teamName,
      memberId: memberId || 'UNKNOWN',
      problemId,
      lang,
      code,
      stdin,
      status: 'QUEUED',
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null
    };

    this.jobs.set(id, job);
    this.queue.push(job);
    this.processNext();
    return id;
  }

  getJob(id) {
    return this.jobs.get(id) || null;
  }

  subscribe(id, callback) {
    if (!this.subscribers.has(id)) {
      this.subscribers.set(id, []);
    }
    this.subscribers.get(id).push(callback);

    // If already finished, trigger immediately
    const job = this.jobs.get(id);
    if (job && (job.status === 'COMPLETED' || job.status === 'FAILED')) {
      callback(job);
    }
  }

  notify(job) {
    const list = this.subscribers.get(job.id);
    if (list) {
      list.forEach(cb => {
        try { cb(job); } catch (e) {}
      });
      if (job.status === 'COMPLETED' || job.status === 'FAILED') {
        this.subscribers.delete(job.id);
      }
    }
  }

  async processNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    this.running++;
    job.status = 'RUNNING';
    job.startedAt = Date.now();
    this.notify(job);

    try {
      if (job.type === 'run') {
        // Quick custom execution or sample run with LeetCode harness
        const problem = job.problemId ? db.getFullProblem(job.problemId) : null;
        const runnableCode = wrapCodeWithHarness(problem, job.lang, job.code);
        const execRes = await executeCodeInSandbox(job.lang, runnableCode, job.stdin);
        job.result = {
          stdout: execRes.stdout,
          stderr: execRes.stderr,
          ok: execRes.ok,
          timedOut: execRes.timedOut,
          compileError: execRes.compileError || false
        };
        job.status = 'COMPLETED';
      } else if (job.type === 'submit') {
        // Full grading against hidden test cases
        const problem = db.getFullProblem(job.problemId);
        if (!problem) {
          job.status = 'FAILED';
          job.error = 'Problem not found';
        } else {
          const grade = await gradeSubmission(problem, job.lang, job.code);
          job.result = grade;
          job.status = 'COMPLETED';

          let complexity = null;
          if (grade.passed) {
            try {
              complexity = analyzeComplexity(job.code, job.lang, problem);
            } catch (err) {
              console.error('Complexity analysis error:', err);
            }
          }

          // Process submission result, award complexity-adjusted score or deduct 5 penalty, track per-problem wrong counts, and log audit record
          const processResult = db.processSubmissionResult({
            teamName: job.teamName,
            memberId: job.memberId,
            problemId: job.problemId,
            verdict: grade.verdict,
            passed: grade.passed,
            details: grade.details,
            lang: job.lang,
            code: job.code,
            complexity
          });

          if (processResult) {
            job.submission = processResult.subRecord;
            job.team = processResult.team;
            job.result.scoring = processResult.subRecord;
            job.result.complexity = complexity || (processResult.subRecord ? {
              timeComplexity: processResult.subRecord.timeComplexity,
              spaceComplexity: processResult.subRecord.spaceComplexity,
              timeDeduction: processResult.subRecord.timeDeduction,
              spaceDeduction: processResult.subRecord.spaceDeduction,
              reviewStatus: processResult.subRecord.reviewStatus,
              reason: processResult.subRecord.reason
            } : null);
          }
        }
      }
    } catch (err) {
      job.status = 'FAILED';
      job.error = err.message || 'Unknown execution error';
    } finally {
      job.completedAt = Date.now();
      this.running--;
      this.notify(job);
      this.processNext();
    }
  }
}

export const executionQueue = new ExecutionQueue(4);
